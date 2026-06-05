"use client"

import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import { Search, SlidersHorizontal, ArrowUpDown, LayoutGrid, List } from "lucide-react"
import { FilterHeader } from "./FilterHeader"
import { ProductGrid } from "./ProductGrid"
import { Template, Category, PriceFilter } from "@/types"
import { cn } from "@/lib/utils"

interface TemplatesPageClientProps {
  templates: Template[]
  isKenyan: boolean
}

type SortOption = "newest" | "price-low" | "price-high" | "popular"
type ViewMode = "grid" | "list"

export function TemplatesPageClient({ templates, isKenyan }: TemplatesPageClientProps) {
  const [activeCategory, setActiveCategory] = useState<Category>("all")
  const [activePriceFilter, setActivePriceFilter] = useState<PriceFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [showFilters, setShowFilters] = useState(true)

  const filteredTemplates = useMemo(() => {
    let result = templates.filter((template) => {
      const categoryMatch = activeCategory === "all" || template.category === activeCategory
      const priceMatch =
        activePriceFilter === "all" ||
        (activePriceFilter === "premium" && !template.isFree) ||
        (activePriceFilter === "free" && template.isFree)
      const searchMatch =
        searchQuery === "" ||
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.techStack.some((tech) =>
          tech.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return categoryMatch && priceMatch && searchMatch
    })

    // Sort
    switch (sortBy) {
      case "price-low":
        result = result.sort((a, b) => {
          const aPrice = isKenyan ? a.priceKes : a.priceUsd
          const bPrice = isKenyan ? b.priceKes : b.priceUsd
          return aPrice - bPrice
        })
        break
      case "price-high":
        result = result.sort((a, b) => {
          const aPrice = isKenyan ? a.priceKes : a.priceUsd
          const bPrice = isKenyan ? b.priceKes : b.priceUsd
          return bPrice - aPrice
        })
        break
      case "popular":
        result = result.sort((a, b) => b.downloadCount - a.downloadCount)
        break
      case "newest":
      default:
        // Already sorted by createdAt from server
        break
    }

    return result
  }, [templates, activeCategory, activePriceFilter, searchQuery, sortBy, isKenyan])

  const premiumCount = templates.filter((t) => !t.isFree).length
  const freeCount = templates.filter((t) => t.isFree).length

  return (
    <div className="min-h-screen bg-devcraft-bg">
      {/* Page Header */}
      <section className="border-b border-devcraft-border">
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.12em] text-devcraft-slate mb-4">
              <span className="text-devcraft-slate-light">Home</span>
              <span className="text-devcraft-border">/</span>
              <span className="text-white">Templates</span>
            </nav>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight">
                  All Templates
                </h1>
                <p className="text-devcraft-slate-light mt-2 max-w-md font-mono text-xs leading-relaxed">
                  Production-ready codebases built with Next.js, React, and Tailwind CSS.
                  {isKenyan && (
                    <span className="text-devcraft-emerald ml-1">Prices in KES</span>
                  )}
                </p>
              </div>

              {/* Stats pills */}
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 rounded-lg bg-devcraft-surface border border-devcraft-border text-xs font-mono text-devcraft-slate-light">
                  {templates.length} total
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-devcraft-violet/10 border border-devcraft-violet/20 text-xs font-mono text-devcraft-violet">
                  {premiumCount} premium
                </span>
                <span className="px-3 py-1.5 rounded-lg bg-devcraft-emerald/10 border border-devcraft-emerald/20 text-xs font-mono text-devcraft-emerald">
                  {freeCount} free
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Toolbar: Search + Sort + View Toggle */}
      <section className="border-b border-devcraft-border bg-devcraft-surface/20 sticky top-16 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-devcraft-slate" />
              <input
                type="text"
                placeholder="Search templates, tech stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-devcraft-surface border border-devcraft-border rounded-xl
                           text-white text-sm placeholder-devcraft-slate
                           focus:outline-none focus:border-devcraft-violet/50 focus:ring-1 focus:ring-devcraft-violet/20
                           transition-all font-mono text-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-devcraft-slate hover:text-white text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "sm:hidden flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-mono transition-all",
                  showFilters
                    ? "bg-devcraft-violet/10 border-devcraft-violet/30 text-devcraft-violet"
                    : "bg-devcraft-surface border-devcraft-border text-devcraft-slate-light hover:text-white"
                )}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>

              {/* Sort dropdown */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-9 pr-8 py-2.5 bg-devcraft-surface border border-devcraft-border rounded-xl
                             text-white text-xs font-mono cursor-pointer
                             focus:outline-none focus:border-devcraft-violet/50
                             transition-all"
                >
                  <option value="newest">Newest</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-devcraft-slate pointer-events-none" />
              </div>

              {/* View mode toggle */}
              <div className="flex items-center border border-devcraft-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2.5 transition-all",
                    viewMode === "grid"
                      ? "bg-devcraft-violet/15 text-devcraft-violet"
                      : "bg-devcraft-surface text-devcraft-slate hover:text-white"
                  )}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2.5 transition-all",
                    viewMode === "list"
                      ? "bg-devcraft-violet/15 text-devcraft-violet"
                      : "bg-devcraft-surface text-devcraft-slate hover:text-white"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <motion.div
          initial={false}
          animate={{
            height: showFilters ? "auto" : 0,
            opacity: showFilters ? 1 : 0,
          }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-8"
        >
          <FilterHeader
            activeCategory={activeCategory}
            activePriceFilter={activePriceFilter}
            onCategoryChange={setActiveCategory}
            onPriceFilterChange={setActivePriceFilter}
            resultCount={filteredTemplates.length}
          />
        </motion.div>

        {/* Results count + active filters summary */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-mono text-devcraft-slate">
            Showing{" "}
            <span className="text-white font-medium">{filteredTemplates.length}</span> of{" "}
            <span className="text-white font-medium">{templates.length}</span> templates
          </p>
          {(activeCategory !== "all" || activePriceFilter !== "all" || searchQuery) && (
            <button
              onClick={() => {
                setActiveCategory("all")
                setActivePriceFilter("all")
                setSearchQuery("")
              }}
              className="text-xs font-mono text-devcraft-violet hover:text-devcraft-violet-glow transition-colors"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Grid / List */}
        {viewMode === "grid" ? (
          <ProductGrid templates={filteredTemplates} />
        ) : (
          <ProductList templates={filteredTemplates} />
        )}
      </section>
    </div>
  )
}

// Simple list view component
function ProductList({ templates }: { templates: Template[] }) {
  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-devcraft-surface border border-devcraft-border flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          Try adjusting your search or filters to see more results.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3">
      {templates.map((template, index) => (
        <motion.div
          key={template.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center gap-4 p-4 bg-devcraft-card border border-devcraft-border rounded-xl
                     hover:border-devcraft-violet/30 transition-all duration-200 group"
        >
          <div className="w-16 h-16 rounded-lg bg-devcraft-surface overflow-hidden shrink-0">
            <img
              src={template.thumbnailUrl || "/placeholder.png"}
              alt={template.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-devcraft-slate">
                {template.category}
              </span>
              {template.isFree && (
                <span className="text-[10px] font-mono text-devcraft-emerald">FREE</span>
              )}
            </div>
            <h3 className="text-sm font-semibold text-white group-hover:text-devcraft-violet-glow transition-colors truncate">
              {template.title}
            </h3>
            <p className="text-xs text-devcraft-slate truncate">{template.description || ""}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-mono text-white">
              {template.isFree ? "Free" : `$${template.priceUsd}`}
            </span>
            <a
              href={`/template/${template.slug}`}
              className="px-4 py-2 rounded-lg bg-devcraft-violet text-white text-xs font-medium
                         hover:bg-violet-600 transition-all"
            >
              View
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  )
}