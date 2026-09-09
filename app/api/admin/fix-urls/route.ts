import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function POST() {
  // Defense-in-depth: proxy.ts guards /api/admin(.*) at the edge, but the
  // route itself must also check — same pattern as every other admin route.
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (!userId || role !== "admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const allTemplates = await db.select().from(templates)

  for (const t of allTemplates) {
    const fixedScreenshots = t.screenshots.map(s =>
      s.startsWith("http") ? s : `https://utfs.io/f/${s}`
    )

    await db.update(templates)
      .set({ screenshots: fixedScreenshots })
      .where(sql`${templates.id} = ${t.id}`)
  }

  return NextResponse.json({ fixed: allTemplates.length })
}