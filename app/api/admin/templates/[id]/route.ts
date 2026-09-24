import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { utapi } from "@/lib/uploadthing-server"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (!userId || role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const data = await db.select().from(templates).where(eq(templates.id, id)).limit(1)
  if (!data.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
  
  return NextResponse.json(data[0])
}


export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (!userId || role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  const [updated] = await db
    .update(templates)
    .set({
      title: body.title,
      slug: body.slug,
      description: body.description,
      category: body.category,
      techStack: body.techStack || [],
      features: body.features || [],
      priceUsd: body.priceUsd || "0.00",
      priceKes: body.priceKes || "0.00",
      livePreviewUrl: body.livePreviewUrl || null,
      zipFileKey: body.zipFileKey,
      screenshots: body.screenshots || [],
      isPublished: body.isPublished ?? true,
    })
    .where(eq(templates.id, id))
    .returning()

  return NextResponse.json({ template: updated })
}

// DELETE template + files from UploadThing
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role
  if (!userId || role !== "admin") return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params

  // Fetch template to get file keys before deleting
  const template = await db.select().from(templates).where(eq(templates.id, id)).limit(1)
  if (!template.length) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const t = template[0]

  // Collect all file keys to delete from UploadThing
  const keysToDelete: string[] = []
  
  if (t.zipFileKey) {
    // Extract key from URL if stored as full URL
    const zipKey = t.zipFileKey.startsWith("http") 
      ? t.zipFileKey.split("/f/").pop() 
      : t.zipFileKey
    if (zipKey) keysToDelete.push(zipKey)
  }

  if (t.screenshots?.length) {
    t.screenshots.forEach(url => {
      const key = url.startsWith("http") 
        ? url.split("/f/").pop() 
        : url
      if (key) keysToDelete.push(key)
    })
  }

  // Delete files from UploadThing
  if (keysToDelete.length > 0) {
    try {
      await utapi.deleteFiles(keysToDelete)
    } catch (err) {
      console.error("Failed to delete files from UploadThing:", err)
      // Continue with DB deletion even if UploadThing fails
    }
  }

  // Delete from database
  await db.delete(templates).where(eq(templates.id, id))

  return NextResponse.json({ success: true, deleted: keysToDelete.length })
}