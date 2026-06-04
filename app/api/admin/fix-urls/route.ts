import { NextResponse } from "next/server"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { sql } from "drizzle-orm"

export async function POST() {
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