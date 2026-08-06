// app/sitemap.ts
import { db } from '@/db'
import { templates } from '@/db/schema'
import { eq } from 'drizzle-orm'

export default async function sitemap() {
  const published = await db.select({ slug: templates.slug, createdAt: templates.createdAt })
    .from(templates).where(eq(templates.isPublished, true))

  return [
    { url: 'https://devcraft.shop', priority: 1 },
    { url: 'https://devcraft.shop/license', priority: 0.3 },
    { url: 'https://devcraft.shop/privacy', priority: 0.3 },
    ...published.map(t => ({
      url: `https://devcraft.shop/template/${t.slug}`,
      lastModified: t.createdAt,
      priority: 0.8,
    })),
  ]
}