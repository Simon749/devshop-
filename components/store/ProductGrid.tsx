"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Template } from "@/types"
import { TemplateCard } from "./TemplateCard"
import { PackageOpen } from "lucide-react"

interface ProductGridProps {
  templates: Template[]
}

export function ProductGrid({ templates }: ProductGridProps) {
  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-devcraft-surface border border-devcraft-border flex items-center justify-center mb-4">
          <PackageOpen className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
        <p className="text-slate-400 text-sm max-w-sm">
          Try adjusting your filters to see more results.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      layout
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <AnimatePresence mode="popLayout">
        {templates.map((template, index) => (
          <TemplateCard key={template.id} template={template} index={index} />
        ))}
      </AnimatePresence>
    </motion.div>
  )
}
