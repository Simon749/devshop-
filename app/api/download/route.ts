// app/api/download/route.ts

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db"
import { templates, downloadHistory } from "@/db/schema"
import { eq, sql} from "drizzle-orm"
import { validateToken, consumeToken } from "@/lib/tokens"
import { utapi } from "@/lib/uploadthing-server"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { message: "Download token required", recoverUrl: "/recover" },
      { status: 400 }
    )
  }

  // Validate token
  const result = await validateToken(token)
  if (!result) {
    return NextResponse.json(
      {
        message: "This download link has expired or already been used.",
        recoverUrl: `${process.env.NEXT_PUBLIC_APP_URL}/recover`,
      },
      { status: 410 }
    )
  }

  const { order, template } = result

  if (!template?.zipFileKey) {
    console.error(`[DOWNLOAD] Template ${template?.id} has no zipFileKey`)
    return NextResponse.json(
      { message: "File not available. Contact support." },
      { status: 500 }
    )
  }

  try {
    // Generate signed URL for private file (valid for 5 minutes)
    const signedUrlData  = await utapi.getSignedURL(template.zipFileKey, {
      expiresIn: 300, // 5 minutes in seconds
    })

    if (!signedUrlData?.url) {
      throw new Error("Failed to generate signed URL")
    }

    // Fetch file from Uploadthing
    const fileRes = await fetch(signedUrlData.url, {
      headers: {
        "Cache-Control": "no-store",
      },
    })

    if (!fileRes.ok) {
      throw new Error(`Uploadthing returned ${fileRes.status}`)
    }

    // Get filename from template title
    const safeTitle = template.title.replace(/[^a-zA-Z0-9\-_\s]/g, "").replace(/\s+/g, "-")
    const filename = `${safeTitle}.zip`

    // Stream response
    const headers = new Headers()
    headers.set("Content-Disposition", `attachment; filename="${filename}"`)
    headers.set("Content-Type", "application/zip")
    headers.set("X-Content-Type-Options", "nosniff")
    headers.set("Cache-Control", "no-store, private")

    const response = new NextResponse(fileRes.body, {
      status: 200,
      headers,
    })

    // Consume token (mark as used)
    await consumeToken(token)

    // Increment download count
    await db
      .update(templates)
      .set({ downloadCount: sql`${templates.downloadCount} + 1` })
      .where(eq(templates.id, template.id))

    // Log to download history
    await db.insert(downloadHistory).values({
      orderId: order.id,
      templateId: template.id,
      customerEmail: order.customerEmail,
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? req.headers.get("x-real-ip") ?? null,
      userAgent: req.headers.get("user-agent") ?? null,
    })

    console.log(`[DOWNLOAD] Token consumed, file streamed for order ${order.id}`)

    return response
  } catch (err: any) {
    console.error("[DOWNLOAD ERROR]", err)
    return NextResponse.json(
      { message: "Failed to stream file. Try again or contact support." },
      { status: 500 }
    )
  }
}
