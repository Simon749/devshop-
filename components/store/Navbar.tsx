"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ExternalLink, ArrowRight, ShoppingCart } from "lucide-react"
import { useCart } from "@/lib/cart-store"

const navLinks = [
  { label: "Templates", href: "/templates" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Preview", href: "https://luxury-website-course-c-te-royale.vercel.app/", external: true },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { toggleCart, totalItems } = useCart()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handler, { passive: true })
    return () => window.removeEventListener("scroll", handler)
  }, [])

  useEffect(() => { setIsOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [isOpen])

  const itemCount = totalItems()

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-devcraft-bg/90 backdrop-blur-xl border-b border-devcraft-border shadow-[0_1px_0_0_rgba(255,255,255,0.03)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[rgba(200,168,75,0.25)] shrink-0">
                <img
                  src="/logo.png"
                  alt="Zyntric Systems"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col leading-none gap-[2px]">
                <span className="font-mono text-[13px] font-medium tracking-[0.1em] uppercase text-white">
                  Zyntric
                </span>
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-[#c8a84b]">
                  Systems
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg
                             font-mono text-[11px] uppercase tracking-[0.08em]
                             text-devcraft-slate-light hover:text-white hover:bg-devcraft-surface/60
                             transition-all duration-200"
                >
                  {link.label}
                  {link.external && <ExternalLink className="w-3 h-3 opacity-50" />}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="flex items-center gap-3">
              {/* Cart */}
              <button
                onClick={toggleCart}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-[4px]
                           bg-devcraft-surface border border-devcraft-border
                           font-mono text-[10px] uppercase tracking-[0.08em]
                           text-devcraft-slate-light hover:text-white
                           hover:border-devcraft-border-hover transition-all duration-200 relative"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Cart</span>
                {itemCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-devcraft-violet
                                   text-white text-[9px] font-bold flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>

              {/* CTA */}
              <Link
                href="/templates"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-[4px]
                           bg-devcraft-violet hover:bg-devcraft-violet-glow text-white
                           font-mono text-[10px] font-medium uppercase tracking-[0.1em]
                           transition-all duration-200 hover:shadow-violet-glow active:scale-[0.98]"
              >
                Browse Templates
                <ArrowRight className="w-3 h-3" />
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden relative w-9 h-9 rounded-[4px] border border-devcraft-border
                           bg-devcraft-surface/50 flex items-center justify-center
                           text-devcraft-slate-light hover:text-white hover:border-devcraft-border-hover
                           transition-all duration-200"
                aria-label={isOpen ? "Close menu" : "Open menu"}
                aria-expanded={isOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[270px] md:hidden
                         bg-devcraft-bg border-l border-devcraft-border flex flex-col"
            >
              <div className="flex items-center justify-between px-5 h-16 border-b border-devcraft-border">
                <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center gap-2.5">
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[rgba(200,168,75,0.25)] shrink-0">
                    <img src="/images/logo.png" alt="Zyntric" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col leading-none gap-[2px]">
                    <span className="font-mono text-[12px] font-medium tracking-[0.1em] uppercase text-white">Zyntric</span>
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-[#c8a84b]">Systems</span>
                  </div>
                </Link>
                <button onClick={() => setIsOpen(false)} className="w-7 h-7 rounded-[4px] flex items-center justify-center text-devcraft-slate-light hover:text-white hover:bg-devcraft-surface transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex-1 px-4 py-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 + 0.1 }}>
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-[4px] font-mono text-[11px] uppercase tracking-[0.08em] text-devcraft-slate-light hover:text-white hover:bg-devcraft-surface border border-transparent hover:border-devcraft-border transition-all"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="w-3 h-3 opacity-50" />}
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Cart Link */}
                <button
                  onClick={() => {
                    setIsOpen(false)
                    toggleCart()
                  }}
                  className="flex items-center justify-between px-4 py-3.5 rounded-[4px] font-mono text-[11px] uppercase tracking-[0.08em] text-devcraft-slate-light hover:text-white hover:bg-devcraft-surface border border-transparent hover:border-devcraft-border transition-all w-full"
                >
                  <span className="flex items-center gap-2">
                    <ShoppingCart className="w-3.5 h-3.5" />
                    Cart
                  </span>
                  {itemCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-devcraft-violet text-white text-[9px] font-bold">
                      {itemCount}
                    </span>
                  )}
                </button>
              </nav>

              <div className="px-4 pb-8 pt-4 border-t border-devcraft-border">
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <Link href="/templates" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-devcraft-violet hover:bg-devcraft-violet-glow text-white font-mono text-[10px] font-medium uppercase tracking-[0.1em] rounded-[4px] transition-all hover:shadow-violet-glow">
                    Browse Templates
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}