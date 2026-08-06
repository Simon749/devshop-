// app/robots.ts
import type { MetadataRoute } from "next"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devshop-sepia.vercel.app/"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",       // all route handlers — checkout, webhooks, download, uploadthing
          "/admin/",     // Clerk-protected admin panel — should never be indexed
          "/recover",    // email-lookup form, no SEO value, don't waste crawl budget
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}