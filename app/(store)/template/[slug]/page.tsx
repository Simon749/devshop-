import { Metadata } from "next"
import { notFound } from "next/navigation"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { eq } from "drizzle-orm"
import { ImageCarousel } from "@/components/store/ImageCarousel"
import { CheckoutButton } from "./CheckoutButton"
import { formatPrice, detectKenyaMarket } from "@/lib/utils"
import { headers } from "next/headers"

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

  if (!template) {
    return { title: "Template Not Found — DevCraft" }
  }

  return {
    title: `${template.title} — DevCraft Marketplace`,
    description: template.description?.slice(0, 160) ?? "Premium web template",
    openGraph: {
      title: template.title,
      description: template.description?.slice(0, 160),
      images: template.screenshots?.[0] ? [{ url: template.screenshots[0] }] : [],
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

  const priceDisplay = formatPrice(
  Number(template.priceUsd),
  Number(template.priceKes),
  false
)

  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-neutral-400">
          <span>Templates</span>
          <span className="mx-2">/</span>
          <span className="capitalize">{template.category}</span>
          <span className="mx-2">/</span>
          <span className="text-white">{template.title}</span>
        </nav>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Screenshots */}
          <div>
            <ImageCarousel
              images={template.screenshots.length > 0 ? template.screenshots : ["/placeholder.png"]}
              alt={template.title}
            />
          </div>

          {/* Right: Details */}
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
            </div>

            {/* Price & CTA */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{priceDisplay}</span>
                {Number(template.priceUsd) === 0 && Number(template.priceKes) === 0 && (
                  <span className="rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs font-medium text-emerald-400">
                    FREE
                  </span>
                )}
              </div>

              <div className="mt-4 space-y-3">
                {template.livePreviewUrl && (
                  <a
                    href={template.livePreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-lg border border-neutral-700 bg-transparent py-3 text-center text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Live Preview →
                  </a>
                )}

                <CheckoutButton template={template} />
              </div>

              <p className="mt-4 text-xs text-neutral-500">
                Extended commercial license included. Use for unlimited client projects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}