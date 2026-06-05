"use client"

import { motion } from "framer-motion"
import { ExternalLink, Download, Sparkles, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Template } from "@/types"
import { formatPriceCompact } from "@/lib/utils"
import { useCurrency } from "@/components/store/CurrencyProvider"
import { getUploadThingUrl } from "@/lib/uploadthing-client"
import { useCart } from "@/lib/cart-store"

interface TemplateCardProps {
  template: Template
  index: number
}

const categoryColors: Record<string, string> = {
  saas: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ecommerce: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  portfolio: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  dashboard: "bg-devcraft-violet/10 text-devcraft-violet border-devcraft-violet/20",
  landing: "bg-devcraft-emerald/10 text-devcraft-emerald border-devcraft-emerald/20",
}

export function TemplateCard({ template, index }: TemplateCardProps) {
  const { isKenyan } = useCurrency()
  const { addItem, items } = useCart()

  const isInCart = items.some((i) => i.id === template.id)

  const imageSource = template.screenshots?.[0]
    ? getUploadThingUrl(template.screenshots[0])
    : "/placeholder.png"

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: template.id,
      title: template.title,
      slug: template.slug,
      priceUsd: template.priceUsd,
      priceKes: template.priceKes,
      isFree: template.isFree,
      thumbnailUrl: template.thumbnailUrl ?? "/placeholder.png",
      category: template.category,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      layout
      className="group relative h-full flex"
    >
      <div className="relative bg-devcraft-card border border-devcraft-border rounded-xl overflow-hidden
                      flex flex-col h-full w-full
                      transition-all duration-500 ease-out
                      hover:border-devcraft-violet/40 hover:shadow-card-hover
                      hover:-translate-y-2">

        {/* Screenshot Container */}
        <div className="relative aspect-[4/3] overflow-hidden shrink-0">
          <img
            src={imageSource}
            alt={template.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png"
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-devcraft-card via-transparent to-transparent opacity-60" />

          {template.isFree && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center gap-1 badge-emerald px-3 py-1.5 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                FREE
              </span>
            </div>
          )}

          {/* Quick add to cart overlay on hover */}
          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={handleAddToCart}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200
                         ${isInCart
                           ? "bg-devcraft-emerald text-white"
                           : "bg-black/50 backdrop-blur-sm text-white hover:bg-devcraft-violet"
                         }`}
              title={isInCart ? "In cart" : "Add to cart"}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col flex-grow">

          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${categoryColors[template.category] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
              {template.category.toUpperCase()}
            </span>
          </div>

          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-devcraft-violet-glow transition-colors duration-300">
            {template.title}
          </h3>

          <p className="text-slate-400 text-sm leading-relaxed mb-3 line-clamp-2">
            {template.description}
          </p>

          {/* Tech Tags */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {template.techStack.slice(0, 4).map((tech) => (
              <span
                key={tech}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-devcraft-surface border border-devcraft-border
                           text-slate-400 transition-all duration-200 hover:scale-105 hover:text-devcraft-violet hover:border-devcraft-violet/30"
              >
                {tech}
              </span>
            ))}
            {template.techStack.length > 4 && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-devcraft-surface border border-devcraft-border text-slate-500">
                +{template.techStack.length - 4}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-auto pt-3 border-t border-devcraft-border">
            <div className="flex flex-col">
              {template.isFree ? (
                <span className="text-devcraft-emerald font-bold text-lg">FREE</span>
              ) : (
                <span className="text-white font-semibold text-sm">
                  {formatPriceCompact(template.priceUsd, template.priceKes, isKenyan)}
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => template.livePreviewUrl && window.open(template.livePreviewUrl, "_blank")}
                disabled={!template.livePreviewUrl}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-devcraft-surface border border-devcraft-border
                           text-slate-400 text-xs font-medium hover:text-white hover:border-devcraft-border-hover
                           transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Preview
              </button>

              

              <Link href={`/template/${template.slug}`}>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-devcraft-surface border border-devcraft-border
                             text-slate-400 text-xs font-medium hover:text-white hover:border-devcraft-border-hover
                             transition-all duration-200"
                >
                  <Download className="w-3.5 h-3.5" />
                  Details
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  )
}