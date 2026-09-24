import { headers } from "next/headers"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { detectKenyaMarket } from "@/lib/utils"
import { CurrencyProvider } from "@/components/store/CurrencyProvider"
import { TemplatesPageClient } from "@/components/store/TemplatesPageClient"

export const metadata = {
  title: "Templates — Zyntric Marketplace",
  description: "Browse production-ready Next.js, React, and Tailwind CSS templates. M-Pesa & Card accepted.",
}

export const revalidate = 3600

export default async function TemplatesPage() {
  const headersList = await headers()
  const isKenyan = detectKenyaMarket(headersList)

  const allTemplates = await db
    .select()
    .from(templates)
    .where(eq(templates.isPublished, true))
    .orderBy(templates.createdAt)

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
      <TemplatesPageClient templates={normalizedTemplates} isKenyan={isKenyan} />
    </CurrencyProvider>
  )
}