"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { HeroSection } from "./HeroSection"
import { FilterHeader } from "./FilterHeader"
import { ProductGrid } from "./ProductGrid"
import { Template, Category, PriceFilter } from "@/types"
import { Code2, Globe, Shield, Zap } from "lucide-react"

interface HomePageClientProps {
  templates: Template[]
  isKenyan: boolean
}

export function HomePageClient({ templates, isKenyan }: HomePageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [activePriceFilter, setActivePriceFilter] = useState<PriceFilter>("all")

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const categoryMatch = activeCategory === "all" || template.category === activeCategory
      const priceMatch =
        activePriceFilter === "all" ||
        (activePriceFilter === "premium" && !template.isFree) ||
        (activePriceFilter === "free" && template.isFree)
      return categoryMatch && priceMatch
    })
  }, [templates, activeCategory, activePriceFilter])

  return (
    <div className="min-h-screen bg-devcraft-bg">
      {/* Hero */}
      <HeroSection />

      {/* Stats Bar */}
      <section className="border-y border-devcraft-border bg-devcraft-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Code2, label: "Templates", value: "6+" },
              { icon: Globe, label: "Countries", value: "50+" },
              { icon: Shield, label: "Secure Payments", value: "M-Pesa + Card" },
              { icon: Zap, label: "Downloads", value: "12,900+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-devcraft-violet/10 border border-devcraft-violet/20 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 text-devcraft-violet" />
                </div>
                <div>
                  <div className="text-white font-bold text-lg">{stat.value}</div>
                  <div className="text-slate-500 text-xs">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24" id="templates">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Browse Templates
          </h2>
          <p className="text-slate-400 max-w-xl">
            Hand-crafted, production-grade templates with clean architecture, modern UI, and dual-market payment support.
            {isKenyan && (
              <span className="text-devcraft-emerald ml-2">🇰🇪 Prices shown in KES</span>
            )}
          </p>
        </motion.div>

        {/* Filters */}
        <div className="mb-10">
          <FilterHeader
            activeCategory={activeCategory}
            activePriceFilter={activePriceFilter}
            onCategoryChange={setActiveCategory}
            onPriceFilterChange={setActivePriceFilter}
            resultCount={filteredTemplates.length}
          />
        </div>

        {/* Grid */}
        <ProductGrid templates={filteredTemplates} />
      </section>

      {/* CTA Section */}
      <section className="border-t border-devcraft-border">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-2xl bg-devcraft-surface border border-devcraft-border p-10 md:p-16 text-center"
          >
            {/* Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-devcraft-violet/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to ship faster?
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Join thousands of developers building with DevCraft templates. 
                Get instant access to production-ready codebases.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#templates"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-devcraft-violet hover:bg-violet-600
                           text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-violet-glow"
                >
                  <Zap className="w-5 h-5" />
                  Browse Templates
                </a>
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-devcraft-card border border-devcraft-border
                           text-slate-300 hover:text-white font-semibold rounded-xl transition-all duration-200
                           hover:border-devcraft-border-hover"
                >
                  View License
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}