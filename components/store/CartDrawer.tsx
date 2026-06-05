"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/lib/cart-store"
import { formatPrice } from "@/lib/utils"
import { useCurrency } from "@/components/store/CurrencyProvider"
import { CheckoutModal } from "./CheckoutModal"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalItems, totalUsd, totalKes, clearCart } = useCart()
  const { isKenyan } = useCurrency()
  const [checkoutItem, setCheckoutItem] = useState<string | null>(null)

  const total = isKenyan ? totalKes() : totalUsd()
  const currency = isKenyan ? "KES" : "USD"

  // Find template for single-item checkout
  const checkoutTemplate = checkoutItem
    ? items.find((i) => i.id === checkoutItem)
    : null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeCart}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md
                         bg-devcraft-bg border-l border-devcraft-border flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 h-16 border-b border-devcraft-border shrink-0">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-devcraft-violet" />
                  <h2 className="font-mono text-sm font-medium text-white tracking-wide">
                    Your Cart
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-devcraft-violet/15 text-devcraft-violet text-xs font-mono">
                    {totalItems()}
                  </span>
                </div>
                <button
                  onClick={closeCart}
                  className="w-8 h-8 rounded-lg bg-devcraft-surface flex items-center justify-center
                             text-devcraft-slate hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-devcraft-surface border border-devcraft-border flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-devcraft-slate" />
                    </div>
                    <h3 className="text-white font-medium mb-2">Your cart is empty</h3>
                    <p className="text-devcraft-slate text-xs font-mono mb-6">
                      Add templates to get started
                    </p>
                    <Link
                      href="/templates"
                      onClick={closeCart}
                      className="px-6 py-2.5 bg-devcraft-violet text-white text-xs font-mono
                                 rounded-lg hover:bg-devcraft-violet-glow transition-all"
                    >
                      Browse Templates
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 p-3 bg-devcraft-surface/50 border border-devcraft-border rounded-xl"
                      >
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-lg bg-devcraft-card overflow-hidden shrink-0">
                          <img
                            src={item.thumbnailUrl || "/placeholder.png"}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="text-sm font-medium text-white truncate">
                                {item.title}
                              </h4>
                              <p className="text-xs text-devcraft-slate font-mono mt-0.5">
                                {item.category.toUpperCase()}
                              </p>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-devcraft-slate hover:text-red-400 transition-colors shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity controls */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-7 rounded-md bg-devcraft-card border border-devcraft-border
                                           flex items-center justify-center text-devcraft-slate
                                           hover:text-white transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-8 text-center text-sm text-white font-mono">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-7 rounded-md bg-devcraft-card border border-devcraft-border
                                           flex items-center justify-center text-devcraft-slate
                                           hover:text-white transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Price */}
                            <span className="text-sm font-mono text-white">
                              {item.isFree
                                ? "FREE"
                                : formatPrice(
                                    item.priceUsd * item.quantity,
                                    item.priceKes * item.quantity,
                                    isKenyan
                                  )}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t border-devcraft-border p-6 space-y-4 shrink-0">
                  {/* Totals */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono text-devcraft-slate">
                      <span>Subtotal</span>
                      <span>{formatPrice(totalUsd(), totalKes(), isKenyan)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-mono text-devcraft-slate">
                      <span>License</span>
                      <span className="text-devcraft-emerald">Extended (included)</span>
                    </div>
                    <div className="pt-2 border-t border-devcraft-border flex justify-between">
                      <span className="text-sm font-medium text-white">Total</span>
                      <span className="text-lg font-bold text-white font-mono">
                        {formatPrice(totalUsd(), totalKes(), isKenyan)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    {items.length === 1 ? (
                      // Single item — direct checkout
                      <button
                        onClick={() => setCheckoutItem(items[0].id)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5
                                   bg-devcraft-violet text-white font-semibold rounded-xl
                                   hover:bg-violet-600 hover:shadow-violet-glow transition-all
                                   active:scale-[0.98]"
                      >
                        <Sparkles className="w-4 h-4" />
                        Checkout
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      // Multiple items — for now, checkout each separately or link to multi-checkout
                      <Link
                        href="/templates"
                        onClick={closeCart}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5
                                   bg-devcraft-violet text-white font-semibold rounded-xl
                                   hover:bg-violet-600 hover:shadow-violet-glow transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        Proceed to Checkout
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={clearCart}
                      className="w-full py-2.5 text-xs font-mono text-devcraft-slate
                                 hover:text-red-400 transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>

                  <p className="text-center text-[10px] font-mono text-devcraft-slate-dark">
                    Instant delivery via email • Secure payment • 24h download window
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Single-item checkout modal */}
      {checkoutTemplate && (
        <CheckoutModal
          template={{
            id: checkoutTemplate.id,
            title: checkoutTemplate.title,
            slug: checkoutTemplate.slug,
            description: "",
            category: checkoutTemplate.category as any,
            techStack: [],
            features: [],
            priceUsd: checkoutTemplate.priceUsd,
            priceKes: checkoutTemplate.priceKes,
            isFree: checkoutTemplate.isFree,
            livePreviewUrl: "",
            thumbnailUrl: checkoutTemplate.thumbnailUrl,
            screenshots: [],
            isPublished: true,
            downloadCount: 0,
          }}
          onClose={() => setCheckoutItem(null)}
        />
      )}
    </>
  )
}