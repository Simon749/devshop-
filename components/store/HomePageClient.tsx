"use client"

import { useState, useMemo } from "react"
import { FilterHeader } from "./FilterHeader"
import { ProductGrid } from "./ProductGrid"
import { Template, Category, PriceFilter } from "@/types"
import { Search, X } from "lucide-react"


interface HomePageClientProps {
  templates: Template[]
  isKenyan: boolean
}

export function HomePageClient({ templates, isKenyan }: HomePageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [activePriceFilter, setActivePriceFilter] = useState<PriceFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const categoryMatch = activeCategory === "all" || template.category === activeCategory
      const priceMatch =
        activePriceFilter === "all" ||
        (activePriceFilter === "premium" && !template.isFree) ||
        (activePriceFilter === "free" && template.isFree)
      const searchMatch =
        searchQuery === "" ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       (template.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.techStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()))
      return categoryMatch && priceMatch && searchMatch
     })
  }, [templates, activeCategory, activePriceFilter, searchQuery])

  return (
    <div className="min-h-screen bg-devcraft-bg">

      {/* Hero */}

       {/* Compact intro — replaces the old hero + stats bar (D2) */}
      <section className="border-b border-devcraft-border">
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-10 md:pt-16 md:pb-12">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl md:text-[40px] leading-[1.05] tracking-tight text-devcraft-foreground font-normal mb-2">
                Templates
              </h1>
              <p className="text-sm text-devcraft-slate-light max-w-md">
                Production-ready digital products built to ship.
                {isKenyan && (
                  <span className="text-devcraft-emerald-glow ml-2 font-mono text-[11px]">
                    🇰🇪 Prices shown in KES
                  </span>
                )}
              </p>
            </div>
      

      {/* Stats Bar */}
      <section className="border-y border-devcraft-border bg-devcraft-surface/30">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Code2,  label: "Templates",       value: "6+" },
              { icon: Globe,  label: "Countries",        value: "50+" },
              { icon: Shield, label: "Secure Payments",  value: "M-Pesa + Card" },
              { icon: ArrowRight, label: "Downloads",    value: "12,900+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-[4px] bg-devcraft-violet/10 border border-devcraft-violet/20 flex items-center justify-center shrink-0">
                  <stat.icon className="w-4 h-4 text-devcraft-violet" />
                </div>
                <div>
                  <div className="font-mono text-[15px] font-medium text-white tracking-tight">
                    {stat.value}
                  </div>
                  <div className="font-mono text-[9px] uppercase tracking-[0.1em] text-devcraft-slate">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {/* Search */}
             <div className="relative w-full md:w-[320px] shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-devcraft-slate" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-devcraft-surface border border-devcraft-border rounded-[4px]
                           pl-9 pr-9 py-2.5 text-sm text-devcraft-foreground placeholder-devcraft-slate
                           focus:outline-none focus:border-devcraft-violet/50 transition-colors duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-devcraft-slate hover:text-devcraft-foreground"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
               </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 md:py-24" id="templates">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="block w-5 h-px bg-devcraft-slate" />
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-devcraft-slate">
              Browse Templates
            </span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl text-white font-normal tracking-tight mb-3">
            Hand-crafted codebases
          </h2>
          <p className="font-mono text-[11px] leading-[1.9] text-devcraft-slate-light max-w-xl font-light">
            Production-grade templates with clean architecture, modern UI, and dual-market payment support.
            {isKenyan && (
              <span className="text-devcraft-emerald ml-2">🇰🇪 Prices shown in KES</span>
            )}
          </p>
        </motion.div>

        <div className="mb-10">
          <FilterHeader
            activeCategory={activeCategory}
            activePriceFilter={activePriceFilter}
            onCategoryChange={setActiveCategory}
            onPriceFilterChange={setActivePriceFilter}
            resultCount={filteredTemplates.length}
          />
        </div>

        <ProductGrid templates={filteredTemplates} />
      </section>

      {/* ── CTA Section — Option C ── */}
      <section className="border-t border-devcraft-border">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-[4px] bg-devcraft-surface border border-devcraft-border"
          >
            {/* Violet → emerald accent bar */}
            <div
              className="h-[2px] w-full"
              style={{
                background: "linear-gradient(90deg, #8b5cf6, #10b981)",
              }}
            />

            <div className="p-10 md:p-14">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-devcraft-violet/[0.12] border border-devcraft-violet/30 text-devcraft-violet-glow font-mono text-[9px] uppercase tracking-[0.12em] px-3 py-[5px] rounded-[3px] mb-8">
                <span className="w-[4px] h-[4px] rounded-full bg-devcraft-emerald shadow-[0_0_5px_rgba(16,185,129,0.6)]" />
                Production-Ready
              </div>

              {/* Headline */}
              <h2 className="font-display text-[clamp(36px,5vw,56px)] leading-[1.0] tracking-[-0.02em] text-white font-normal mb-8">
                Ship your next project<br />
                <span className="italic text-white/45">in hours, not weeks.</span>
              </h2>

              {/* Tech stack pills */}
              <div className="flex flex-wrap gap-2 mb-10">
                {["Next.js", "React", "Tailwind CSS", "Neon DB", "TypeScript", "Vercel-ready", "Shadcn UI"].map(
                  (tech) => (
                    <span
                      key={tech}
                      className="font-mono text-[9px] uppercase tracking-[0.1em] text-devcraft-slate border border-devcraft-border px-3 py-1 rounded-full"
                    >
                      {tech}
                    </span>
                  )
                )}
              </div>

              {/* Footer row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pt-8 border-t border-devcraft-border">
                {/* Trust strip */}
                <div className="flex flex-wrap gap-5">
                  {["Extended license", "M-Pesa + Card", "Instant download"].map((item) => (
                    <span
                      key={item}
                      className="flex items-center gap-[5px] font-mono text-[9px] uppercase tracking-[0.08em] text-devcraft-slate-dark"
                    >
                      <span className="w-[12px] h-[12px] rounded-full border border-devcraft-slate-dark flex items-center justify-center text-devcraft-emerald text-[7px] shrink-0">
                        ✓
                      </span>
                      {item}
                    </span>
                  ))}
                </div>

                {/* CTA buttons */}
                <div className="flex items-center gap-3 shrink-0">
                  <a
                    href="/templates"
                    className="flex items-center gap-2 px-6 py-3 bg-devcraft-violet hover:bg-devcraft-violet-glow text-white font-mono text-[10px] font-medium uppercase tracking-[0.1em] rounded-[3px] transition-all duration-200 hover:shadow-violet-glow active:scale-[0.98] whitespace-nowrap"
                  >
                    Browse Templates
                    <ArrowRight className="w-3 h-3" />
                  </a>
                  <a
                    href="/license"
                    className="flex items-center gap-2 px-6 py-3 bg-transparent border border-devcraft-border hover:border-devcraft-border-hover text-devcraft-slate-light hover:text-white font-mono text-[10px] uppercase tracking-[0.1em] rounded-[3px] transition-all duration-200 whitespace-nowrap"
                  >
                    View License
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
          <section className="max-w-7xl mx-auto px-6 py-10 md:py-12" id="templates">
        <FilterHeader
          activeCategory={activeCategory}
          activePriceFilter={activePriceFilter}
          onCategoryChange={setActiveCategory}
          onPriceFilterChange={setActivePriceFilter}
          resultCount={filteredTemplates.length}
        />

        <div className="mt-8">
          <ProductGrid templates={filteredTemplates} />
         </div>
        </div>
      </section>
    </div>
  )
}
