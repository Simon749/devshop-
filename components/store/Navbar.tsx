"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, ExternalLink, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Templates", href: "/#templates" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Preview", href: "https://luxury-website-course-c-te-royale.vercel.app/", external: true },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

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

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-devcraft-bg/90 backdrop-blur-xl border-b border-devcraft-border shadow-[0_1px_0_0_rgba(255,255,255,0.03)]"
            : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Coin logo — swap src to your actual image path */}
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[rgba(200,168,75,0.25)] shrink-0">
                <Image
                  src="/logo.png"
                  alt="Zyntric Systems"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Name — two-tier, mono */}
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

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/#templates"
                className="flex items-center gap-2 px-4 py-2
                           bg-devcraft-violet hover:bg-devcraft-violet-glow text-white
                           font-mono text-[10px] font-medium uppercase tracking-[0.1em]
                           rounded-[4px] transition-all duration-200
                           hover:shadow-violet-glow active:scale-[0.98]"
              >
                Browse Templates
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

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
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[270px] md:hidden
                         bg-devcraft-bg border-l border-devcraft-border flex flex-col"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 h-16 border-b border-devcraft-border">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden border border-[rgba(200,168,75,0.25)] shrink-0">
                    <Image
                      src="/images/logo.png"
                      alt="Zyntric Systems"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col leading-none gap-[2px]">
                    <span className="font-mono text-[12px] font-medium tracking-[0.1em] uppercase text-white">
                      Zyntric
                    </span>
                    <span className="font-mono text-[7px] tracking-[0.18em] uppercase text-[#c8a84b]">
                      Systems
                    </span>
                  </div>
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-[4px] flex items-center justify-center
                             text-devcraft-slate-light hover:text-white hover:bg-devcraft-surface
                             transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 px-4 py-6 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      target={link.external ? "_blank" : undefined}
                      rel={link.external ? "noopener noreferrer" : undefined}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between px-4 py-3.5 rounded-[4px]
                                 font-mono text-[11px] uppercase tracking-[0.08em]
                                 text-devcraft-slate-light hover:text-white hover:bg-devcraft-surface
                                 border border-transparent hover:border-devcraft-border
                                 transition-all duration-200"
                    >
                      {link.label}
                      {link.external && <ExternalLink className="w-3 h-3 opacity-50" />}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Drawer CTA */}
              <div className="px-4 pb-8 pt-4 border-t border-devcraft-border">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Link
                    href="/#templates"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3
                               bg-devcraft-violet hover:bg-devcraft-violet-glow text-white
                               font-mono text-[10px] font-medium uppercase tracking-[0.1em]
                               rounded-[4px] transition-all duration-200 hover:shadow-violet-glow"
                  >
                    Browse Templates
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </motion.div>

                <p className="text-center font-mono text-[9px] uppercase tracking-[0.1em] text-devcraft-slate-dark mt-4">
                  M-Pesa &amp; Card · Extended License
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}