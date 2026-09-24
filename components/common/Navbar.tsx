"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ShoppingCart, Search, ArrowRight } from "lucide-react"
import { useCart } from "@/lib/cart-store"

const navLinks = [
  { label: "Templates", href: "/templates" },
  { label: "License",   href: "/license" },
  { label: "Docs",      href: "/docs" },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { toggleCart, totalItems } = useCart()
  const itemCount = totalItems()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-devcraft-bg/90 backdrop-blur-xl border-b border-devcraft-border shadow-[0_1px_0_0_rgba(255,255,255,0.03)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            {/* Circular coin logo — place your image at /images/logo.png */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div
                className="w-8 h-8 rounded-full shrink-0 overflow-hidden
                          bg-devcraft-surface
                          border border-devcraft-violet/25 bg-devcraft-surface"
                style={{
                  backgroundImage: "url('/logo.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                role="img"
                aria-label="Zyntric Systems logo"
              />
              <div className="flex flex-col leading-none gap-[2px]">
                <span className="font-mono text-[13px] font-medium tracking-[0.1em] uppercase text-devcraft-foreground">
                   Zyntric
                 </span>
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-devcraft-violet-glow">
                   Systems
                 </span>
              </div>
            </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em]
                             text-devcraft-slate-light hover:text-devcraft-foreground
                             hover:bg-devcraft-surface/60 rounded-lg
                             transition-all duration-200"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
               <div className="flex items-center gap-2">
              <Link
                href="/templates"
                aria-label="Search templates"
                className="hidden sm:flex w-9 h-9 rounded-[4px] border border-devcraft-border
                           bg-devcraft-surface/50 items-center justify-center
                           text-devcraft-slate-light hover:text-devcraft-foreground hover:border-devcraft-border-hover
                           transition-all duration-200"
              >
                <Search className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={toggleCart}
                aria-label="Open cart"
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[4px]
                           flex w-auto rounded-[4px] border border-devcraft-border
                           bg-devcraft-surface/50 items-center justify-center relative
                           font-mono text-[10px] uppercase tracking-[0.08em]
                           text-devcraft-slate-light hover:text-white
                           hover:border-devcraft-border-hover transition-all duration-200"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-devcraft-violet
                                   text-devcraft-bg text-[9px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              

              {/* CTA */}
              <a
                href="/templates"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-[4px]
                           bg-devcraft-violet hover:bg-devcraft-violet-glow text-white
                           font-mono text-[10px] font-medium uppercase tracking-[0.1em]
                           transition-all duration-200 hover:shadow-violet-glow active:scale-[0.98]"
              >
                Browse Templates
                <ArrowRight className="w-3 h-3" />
              </a>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden w-9 h-9 rounded-[4px] bg-devcraft-surface
                           border border-devcraft-border flex items-center justify-center
                           text-devcraft-slate-light hover:text-devcraft-foreground
                           hover:border-devcraft-border-hover transition-all duration-200"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <X className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                        <Menu className="w-4 h-4" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

          </div>
        </div>
      </motion.header>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden glass
                       bg-devcraft-bg/95 backdrop-blur-xl
                       border-b border-devcraft-border"
          >
            <div className="px-6 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-4 py-3 rounded-[4px]
                             font-mono text-[11px] uppercase tracking-[0.08em]
                             text-devcraft-slate-light hover:text-devcraft-foreground
                             hover:bg-devcraft-surface border border-transparent
                             hover:border-devcraft-border transition-all duration-200"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-devcraft-border">
                <a
                  href="/templates"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-[4px]
                             bg-devcraft-violet hover:bg-devcraft-violet-glow text-white
                             font-mono text-[10px] font-medium uppercase tracking-[0.1em]
                             transition-all duration-200 hover:shadow-violet-glow"
                >
                  Browse Templates
                  <ArrowRight className="w-3 h-3" />
                </a>
                <p className="text-center font-mono text-[9px] uppercase tracking-[0.1em]
                              text-devcraft-slate-dark mt-3">
                  M-Pesa &amp; Card · Extended License
                </p>
              </div>
               <button
                onClick={() => { setMobileOpen(false); toggleCart() }}
                className="flex items-center justify-between w-full px-4 py-3 rounded-[4px]
                           font-mono text-[11px] uppercase tracking-[0.08em]
                           text-devcraft-slate-light hover:text-devcraft-foreground
                           hover:bg-devcraft-surface border border-transparent
                           hover:border-devcraft-border transition-all duration-200"
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Cart
                </span>
                {itemCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-devcraft-violet text-devcraft-bg text-[9px] font-bold">
                    {itemCount}
                  </span>
                )}
              </button>

              <p className="text-center font-mono text-[9px] uppercase tracking-[0.1em]
                            text-devcraft-slate-dark pt-3 mt-2 border-t border-devcraft-border">
                M-Pesa &amp; Card · Extended License
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
