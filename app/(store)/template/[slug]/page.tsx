// app/(store)/template/[slug]/page.tsx
import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { eq, and, ne } from "drizzle-orm"
import { ImageCarousel } from "@/components/store/ImageCarousel"
import { TemplateCard } from "@/components/store/TemplateCard"
import { CurrencyProvider } from "@/components/store/CurrencyProvider"
import { CheckoutButton } from "./CheckoutButton"
import { formatPrice, detectKenyaMarket } from "@/lib/utils"
import { headers } from "next/headers"

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://devcraft.shop"

interface PageProps {
  params: Promise<{ slug: string }>
}

// ── Generate metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const template = await db
    .select()
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1)
    .then((rows) => rows[0])

  // Unpublished/deleted templates still resolve a row via slug lookup, so
  // without this check a draft could get indexed with real metadata even
  // though the page itself 404s. Keep this in sync with the notFound()
  // check in the page component below.
  if (!template || !template.isPublished) {
    return {
      title: "Template Not Found — Zyntric",
      robots: { index: false, follow: false },
    }
  }

  const description = template.description?.slice(0, 160) ?? "Premium web template"
  const canonicalUrl = `${SITE_URL}/template/${template.slug}`
  const ogImage = template.screenshots?.[0]

  return {
    title: `${template.title} — Zyntric Marketplace`,
    description,
    alternates: { canonical: canonicalUrl },
     openGraph: {
       title: template.title,
       description,
    },
    openGraph: {
      title: template.title,
      description,
      url: canonicalUrl,
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: template.title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: template.title,
      description,
      images: ogImage ? [ogImage] : [],
    },
  }
}

// ── Generate static params ──────────────────────────────────────────────────
export async function generateStaticParams() {
  const all = await db.select({ slug: templates.slug }).from(templates).where(eq(templates.isPublished, true))
  return all.map((t) => ({ slug: t.slug }))
}

// ── Page component ──────────────────────────────────────────────────────────
export default async function TemplatePage({ params }: PageProps) {
  const { slug } = await params
  const headersList = await headers()
  const isKenyan = detectKenyaMarket(headersList)

  const template = await db
    .select()
    .from(templates)
    .where(eq(templates.slug, slug))
    .limit(1)
    .then((rows) => rows[0])

  if (!template || !template.isPublished) {
    notFound()
  }

  const priceDisplay = formatPrice(Number(template.priceUsd), Number(template.priceKes), isKenyan)

  const isFree = Number(template.priceUsd) === 0 && Number(template.priceKes) === 0

  // Related templates — same category, real DB rows only, no invented content.
  // Empty categories (or a category with just this one template) simply render nothing.
  const relatedRaw = await db
    .select()
    .from(templates)
    .where(
      and(
        eq(templates.category, template.category),
        eq(templates.isPublished, true),
        ne(templates.id, template.id)
      )
    )
    .limit(3)

  const related = relatedRaw.map((t) => ({
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

  // JSON-LD Product schema — lets Google show price/availability rich
  // results for this listing. Currency is fixed to USD here since Google's
  // Product schema expects one price/currency pair per Offer; the KES price
  // is a display-only conversion shown in the UI, not a separate offer.
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: template.title,
    description: template.description,
    image: template.screenshots?.length ? template.screenshots : undefined,
    category: template.category,
    offers: {
      "@type": "Offer",
      price: Number(template.priceUsd).toFixed(2),
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/template/${template.slug}`,
    },
  }

  return (
    <main className="min-h-screen bg-devcraft-bg text-devcraft-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-neutral-400">
          <span>Templates</span>
           <nav className="mb-6 font-mono text-xs text-devcraft-slate">
           <Link href="/templates" className="hover:text-devcraft-foreground transition-colors">Templates</Link>

          <span className="mx-2">/</span>
          <span className="capitalize">{template.category}</span>
          <span className="mx-2">/</span>
          <span className="text-devcraft-foreground">{template.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
           {/* Left: large preview */}
          <div>
            <ImageCarousel
              images={template.screenshots.length > 0 ? template.screenshots : ["/placeholder.png"]}
              alt={template.title}
            />
          </div>

          {/* Right: details + purchase */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{template.title}</h1>
              <p className="mt-2 text-neutral-400">{template.description}</p>
            </div>

            {/* Tech Stack */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Tech Stack
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-full bg-neutral-800 px-3 py-1 text-sm text-neutral-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Features
              </h3>
              <ul className="mt-3 space-y-2">
                {template.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-neutral-300">
                    <span className="mt-1 text-emerald-400">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
               <h1 className="font-display text-3xl tracking-tight text-devcraft-foreground">{template.title}</h1>
               <p className="mt-2 text-sm text-devcraft-slate-light leading-relaxed">{template.description}</p>
            </div>

            {/* Price & CTA — kept visible without scrolling, purchase logic untouched */}
             <div className="rounded-xl border border-devcraft-border bg-devcraft-surface p-6">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-3xl text-devcraft-foreground">{priceDisplay}</span>
                {isFree && (
                 <span className="rounded-full bg-devcraft-emerald/15 px-2 py-0.5 font-mono text-xs text-devcraft-emerald-glow">
                    FREE
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {template.livePreviewUrl && (
                  <a
                    href={template.livePreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="block w-full rounded-lg border border-devcraft-border bg-transparent py-3 text-center text-sm font-medium text-devcraft-foreground transition hover:border-devcraft-border-hover hover:bg-devcraft-card"
                   >
                    Live Preview →
                  </a>
                )}

                <CheckoutButton template={template} />
              </div>

               <p className="mt-4 font-mono text-[11px] text-devcraft-slate">
                {template.licenseType === "extended" ? "Extended" : template.licenseType} commercial license included.{" "}
                <Link href="/license" className="underline hover:text-devcraft-slate-light">
                  Full terms
                </Link>
               </p>
            </div>
            {/* Technology */}
            <div>
             <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-devcraft-slate">
                Technology
             </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {template.techStack.map((tech) => (
                  <span
                   key={tech}
                    className="rounded-full border border-devcraft-border bg-devcraft-surface px-3 py-1 font-mono text-xs text-devcraft-slate-light"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* What's Included */}
            {template.features.length > 0 && (
             <div>
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-devcraft-slate">
                  What&rsquo;s Included
                </h3>
                <ul className="mt-3 space-y-2">
                  {template.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-devcraft-slate-light">
                      <span className="mt-0.5 text-devcraft-emerald-glow">✓</span>
                      {feature}
                    </li>
                  ))}
               </ul>
              </div>
            )}

            {/* Support — real links only, no invented documentation promises */}
            <div className="border-t border-devcraft-border pt-6">
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-devcraft-slate mb-3">
                Support
             </h3>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/recover" className="text-devcraft-slate-light hover:text-devcraft-foreground transition-colors">
                  Lost your download link? Recover it →
                </Link>
                <Link href="/license" className="text-devcraft-slate-light hover:text-devcraft-foreground transition-colors">
                 Read the full license terms →
                </Link>
              </div>
            </div>
           </div>
         </div>

        {/* Related templates — real DB query, same category, only renders if any exist */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-devcraft-border">
            <h2 className="font-display text-2xl text-devcraft-foreground mb-6">More in {template.category}</h2>
           <CurrencyProvider isKenyan={isKenyan}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((t, i) => (
                  <TemplateCard key={t.id} template={t} index={i} />
                ))}
              </div>
            </CurrencyProvider>
          </section>
        )}
       </div>
    </main>
  )
}
