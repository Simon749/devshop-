"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ExternalLink,
  Check,
  ChevronRight,
  Shield,
  Zap,
  Clock,
  Globe,
  Download,
  Sparkles,
} from "lucide-react"
import Link from "next/link"
import { Template } from "@/types"
import { formatPrice } from "@/lib/utils"
import { useCurrency } from "@/components/store/CurrencyProvider"
import { ImageCarousel } from "@/components/store/ImageCarousel"
import { CheckoutModal } from "@/components/store/CheckoutModal"

interface TemplateDetailClientProps {
  template: Template
}

export function TemplateDetailClient({ template }: TemplateDetailClientProps) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const { isKenyan } = useCurrency()

  const categoryColors: Record<string, string> = {
    saas: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    ecommerce: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    portfolio: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    dashboard: "bg-devcraft-violet/10 text-devcraft-violet border-devcraft-violet/20",
    landing: "bg-devcraft-emerald/10 text-devcraft-emerald border-devcraft-emerald/20",
  }

  const allImages = [
    template.thumbnailUrl,
    ...template.screenshots.filter((s) => s !== template.thumbnailUrl)
  ].filter((s): s is string => s !== null && s !== undefined)

  return (
    <div className="min-h-screen bg-devcraft-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="flex items-center gap-1 hover:text-devcraft-violet transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Gallery
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-400 capitalize">{template.category}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-300">{template.title}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <ImageCarousel images={allImages} alt={template.title} />
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${categoryColors[template.category] || "bg-slate-500/10 text-slate-400 border-slate-500/20"}`}>
                  {template.category.toUpperCase()}
                </span>
                {template.isFree && (
                  <span className="inline-flex items-center gap-1 badge-emerald px-3 py-1 text-xs font-semibold">
                    <Sparkles className="w-3 h-3" />
                    FREE
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{template.title}</h1>
              <p className="text-slate-400 text-lg leading-relaxed">{template.description}</p>
            </div>

            <div className="flex items-center gap-6 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span>{template.downloadCount.toLocaleString()} downloads</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-devcraft-emerald" />
                <span className="text-devcraft-emerald">Extended License</span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Tech Stack</h3>
              <div className="flex flex-wrap gap-2">
                {template.techStack.map((tech) => (
                  <span key={tech} className="px-3 py-1.5 rounded-lg bg-devcraft-surface border border-devcraft-border text-slate-300 text-sm font-medium hover:border-devcraft-violet/40 hover:text-devcraft-violet transition-all duration-200">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Key Features</h3>
              <ul className="space-y-2.5">
                {template.features.map((feature, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }} className="flex items-start gap-3">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-devcraft-violet/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-devcraft-violet" />
                    </div>
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="bg-devcraft-surface/50 border border-devcraft-border rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">License Terms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[{ icon: Zap, text: "Unlimited client projects" }, { icon: Globe, text: "Commercial use allowed" }, { icon: Clock, text: "Lifetime access" }, { icon: Shield, text: "No redistribution" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-sm text-slate-400">
                    <Icon className="w-4 h-4 text-devcraft-violet" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {template.livePreviewUrl && (
                  <Link href={template.livePreviewUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-devcraft-surface border border-devcraft-border text-slate-300 font-semibold hover:text-white hover:border-devcraft-border-hover transition-all duration-200">
                    <ExternalLink className="w-5 h-5" />
                    Live Preview
                  </Link>
                )}
                <button onClick={() => setIsCheckoutOpen(true)} className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-devcraft-violet text-white font-semibold text-lg hover:bg-violet-600 hover:shadow-violet-glow transition-all duration-200 active:scale-[0.98]">
                  {template.isFree ? (
                    <><Download className="w-5 h-5" /> Download Free</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Buy Now — {formatPrice(template.priceUsd, template.priceKes, isKenyan)}</>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-slate-500 mt-3">Instant delivery via email • Secure payment • 24h download window</p>
            </div>
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isCheckoutOpen && <CheckoutModal template={template} onClose={() => setIsCheckoutOpen(false)} />}
      </AnimatePresence>
    </div>
  )
}