import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db" // your drizzle instance
import { templates } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(req: NextRequest) {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  
  if (!userId || role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    
    // Validate required fields
    if (!body.title || !body.slug || !body.category || !body.zipFileKey) {
      return NextResponse.json(
        { error: "Missing required fields" }, 
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const existing = await db
      .select()
      .from(templates)
      .where(eq(templates.slug, body.slug))
      .limit(1)

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Slug already exists" }, 
        { status: 409 }
      )
    }

    // Insert template
    const [template] = await db
      .insert(templates)
      .values({
        title: body.title,
        slug: body.slug,
        description: body.description || null,
        category: body.category,
        techStack: body.techStack || [],
        features: body.features || [],
        priceUsd: body.priceUsd || "0.00",
        priceKes: body.priceKes || "0.00",
        licenseType: "extended",
        livePreviewUrl: body.livePreviewUrl || null,
        zipFileKey: body.zipFileKey, // NEVER exposed to client
        screenshots: body.screenshots || [],
        isPublished: body.isPublished ?? true,
      })
      .returning()

    return NextResponse.json({ success: true, template })
  } catch (error) {
    console.error("Failed to create template:", error)
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    )
  }
}