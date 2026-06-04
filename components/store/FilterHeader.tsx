"use client"

import { motion } from "framer-motion"
import { Category, PriceFilter } from "@/types"
import { cn } from "@/lib/utils"
import { Filter, Crown, Gift, LayoutGrid } from "lucide-react"

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

const priceFilters: { value: PriceFilter; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All Templates", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
  { value: "premium", label: "Premium Only", icon: <Crown className="w-3.5 h-3.5" /> },
  { value: "free", label: "Free Only", icon: <Gift className="w-3.5 h-3.5" /> },
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 bg-devcraft-surface/80 border border-devcraft-border rounded-xl p-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => onCategoryChange(cat.value)}
              className={cn(
                "relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-300",
                activeCategory === cat.value
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
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
