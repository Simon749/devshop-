// app/sitemap.ts
import type { MetadataRoute } from "next"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { eq } from "drizzle-orm"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devshop-sepia.vercel.app/"

// Same ISR interval as the home page gallery (2.2.1) — no need to hit the DB
// on every crawler request.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const published = await db
    .select({
      slug: templates.slug,
      createdAt: templates.createdAt,
    })
    .from(templates)
    .where(eq(templates.isPublished, true))

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/license`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ]

  const templateRoutes: MetadataRoute.Sitemap = published.map((t) => ({
    url: `${SITE_URL}/template/${t.slug}`,
    lastModified: t.createdAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...templateRoutes]
}