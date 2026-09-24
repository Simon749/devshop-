import { headers } from "next/headers"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { detectKenyaMarket } from "@/lib/utils"
import { CurrencyProvider } from "@/components/store/CurrencyProvider"
import { HomePageClient } from "@/components/store/HomePageClient"

export const revalidate = 3600

export default async function HomePage() {
  // Detect country from Vercel IP header
  const headersList = await headers()
  const isKenyan = detectKenyaMarket(headersList)

  // Fetch published templates from DB
  const allTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.isPublished, true))
    .orderBy(templates.createdAt)

  // Normalize DB data to match Template type
  const normalizedTemplates = allTemplates.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    description: t.description || "",
    category: t.category,
    techStack: t.techStack || [],
    features: t.features || [],
    priceUsd: Number(t.priceUsd),
    priceKes: Number(t.priceKes),
    isFree: Number(t.priceUsd) === 0 && Number(t.priceKes) === 0,
    livePreviewUrl: t.livePreviewUrl || "",
    thumbnailUrl: t.screenshots?.[0] || "",
    screenshots: t.screenshots || [],
    isPublished: t.isPublished,
    downloadCount: t.downloadCount,
  }))

  return (
    <CurrencyProvider isKenyan={isKenyan}>
      <HomePageClient 
        templates={normalizedTemplates} 
        isKenyan={isKenyan} 
      />
    </CurrencyProvider>
  )
}