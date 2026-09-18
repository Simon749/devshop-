"use client"

import { Category, PriceFilter } from "@/types"
import { cn } from "@/lib/utils"


interface FilterHeaderProps {
  activeCategory: Category
  activePriceFilter: PriceFilter
  onCategoryChange: (category: Category) => void
  onPriceFilterChange: (filter: PriceFilter) => void
  resultCount: number
}

const categories: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "saas", label: "SaaS" },
  { value: "ecommerce", label: "E-Commerce" },
  { value: "portfolio", label: "Portfolio" },
  { value: "dashboard", label: "Dashboard" },
  { value: "landing", label: "Landing" },
]

const priceFilters: { value: PriceFilter; label: string }[] = [
 { value: "all", label: "All" },
 { value: "free", label: "Free" },
 { value: "premium", label: "Premium" },
 ]

export function FilterHeader({
  activeCategory,
  activePriceFilter,
  onCategoryChange,
  onPriceFilterChange,
  resultCount,
}: FilterHeaderProps) {
  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-devcraft-border">
      {/* Category chips — plain, individually bordered, no boxed container */}
     <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-colors duration-150 shrink-0",
              activeCategory === cat.value
                ? "border-devcraft-violet/40 bg-devcraft-violet/[0.10] text-devcraft-violet-glow"
                : "border-devcraft-border text-devcraft-slate-light hover:border-devcraft-border-hover hover:text-devcraft-foreground"
            )}
          >
            {cat.label}
          </button>
        ))}
     </div>

     {/* Price filter + result count */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5">
          {priceFilters.map((filter) => (
             <button
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              key={filter.value}
             onClick={() => onPriceFilterChange(filter.value)}
              className={cn(
                "relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300",
                activeCategory === cat.value
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
                "px-3 py-1 rounded-full text-xs font-mono uppercase tracking-[0.06em] transition-colors duration-150",
              activePriceFilter === filter.value
                ? "text-devcraft-violet-glow"
                 : "text-devcraft-slate hover:text-devcraft-slate-light"
               )}
              )}
            >
              {activeCategory === cat.value && (
                <motion.div
                  layoutId="activeCategory"
                  className="absolute inset-0 bg-devcraft-violet/15 border border-devcraft-violet/30 rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{cat.label}</span>
              {filter.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Filter className="w-4 h-4" />
          <span>{resultCount} template{resultCount !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Price Filter Toggle */}
      <div className="flex items-center gap-2">
        {priceFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onPriceFilterChange(filter.value)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-all duration-300",
              activePriceFilter === filter.value
                ? "bg-devcraft-violet/10 border-devcraft-violet/40 text-devcraft-violet"
                : "bg-devcraft-surface/50 border-devcraft-border text-slate-400 hover:text-slate-200 hover:border-devcraft-border-hover"
            )}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  )
}
