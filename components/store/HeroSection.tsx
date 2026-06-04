"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { useStore } from "@/lib/store"

export function HeroSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const addSubscriber = useStore((state) => state.addSubscriber)
  const hasSubscriber = useStore((state) => state.hasSubscriber)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes("@")) return
    if (hasSubscriber(email)) { setSubmitted(true); return }
    addSubscriber(email, "newsletter")
    setSubmitted(true)
    setEmail("")
  }

  return (
    <section className="relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full bg-devcraft-violet/[0.08] blur-[140px]" />
        <div className="absolute -bottom-20 right-16 w-[380px] h-[380px] rounded-full bg-devcraft-emerald/[0.06] blur-[120px]" />
      </div>

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(var(--devcraft-border) 0.5px, transparent 0.5px), linear-gradient(90deg, var(--devcraft-border) 0.5px, transparent 0.5px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 md:pt-36 md:pb-28">

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3 mb-10"
        >
          <span className="block w-5 h-px bg-devcraft-slate" />
          <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-devcraft-slate">
            Production-Ready Templates
          </span>
        </motion.div>

        {/* Headline — editorial, left-aligned */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-[clamp(44px,7.5vw,84px)] leading-[1.0] tracking-[-0.025em] text-white mb-0 max-w-[760px]"
        >
          <span className="block">Ship apps</span>
          <span className="block italic text-white/60">in hours,</span>
          <span className="block">
            {/* Inline accent chip */}
            <span className="inline-flex items-center gap-2 align-middle
                             bg-devcraft-violet/[0.12] border border-devcraft-violet/[0.35]
                             text-devcraft-violet-glow font-mono text-[13px] not-italic
                             tracking-[0.04em] px-3 py-1 rounded-[4px]
                             relative -top-1 mr-2">
              <span className="w-[5px] h-[5px] rounded-full bg-devcraft-emerald
                               shadow-[0_0_6px_1px_rgba(16,185,129,0.6)] shrink-0" />
              not weeks
            </span>
            <span className="opacity-0 select-none">not weeks.</span>
          </span>
        </motion.h1>

        {/* Bottom row — sub + actions split */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 flex flex-col md:flex-row md:items-end md:justify-between gap-10"
        >
          {/* Left: subtitle */}
          <p className="font-mono text-xs leading-[1.9] text-devcraft-slate-light max-w-[280px] font-light tracking-[0.01em]">
            High-performance codebases built with{" "}
            <span className="text-white font-normal">Next.js, React,</span>{" "}
            Tailwind CSS &amp;{" "}
            <span className="text-white font-normal">Neon DB.</span>{" "}
            Templates built for people who know what they&apos;re doing.
          </p>

          {/* Right: email + trust */}
          <div className="flex flex-col items-start md:items-end gap-4">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-5 py-3 rounded-lg
                           bg-devcraft-emerald/10 border border-devcraft-emerald/20"
              >
                <CheckCircle2 className="w-4 h-4 text-devcraft-emerald shrink-0" />
                <span className="text-devcraft-emerald font-mono text-xs tracking-wide">
                  You&apos;re on the list!
                </span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex">
                <div
                  className="flex border border-devcraft-border-hover rounded-[4px] overflow-hidden
                             bg-devcraft-surface focus-within:border-devcraft-violet/50
                             focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]
                             transition-all duration-200"
                >
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent border-none outline-none font-mono text-[11px]
                               tracking-[0.03em] text-white placeholder-devcraft-slate
                               px-4 py-3 w-[200px] sm:w-[220px]"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-2 bg-devcraft-violet hover:bg-devcraft-violet-glow
                               text-white font-mono text-[10px] font-medium tracking-[0.1em]
                               uppercase px-5 py-3 whitespace-nowrap transition-colors duration-150
                               active:scale-[0.98]"
                  >
                    Get free templates
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </form>
            )}

            {/* Trust strip */}
            <div className="flex items-center gap-5 font-mono text-[10px] uppercase tracking-[0.08em] text-devcraft-slate">
              {["Extended license", "M-Pesa + Card", "Instant download"].map((item) => (
                <span key={item} className="flex items-center gap-[5px]">
                  <span
                    className="w-[13px] h-[13px] rounded-full border border-devcraft-slate-dark
                               flex items-center justify-center text-devcraft-emerald text-[8px]"
                  >
                    ✓
                  </span>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tech stack ticker */}
      <div className="border-t border-devcraft-border overflow-hidden">
        <div className="flex whitespace-nowrap animate-[dc-ticker_22s_linear_infinite]">
          {[...Array(2)].map((_, pass) => (
            <span key={pass} className="flex shrink-0">
              {["Next.js", "React", "Tailwind CSS", "Neon DB", "TypeScript", "Vercel-ready", "Shadcn UI", "Framer Motion"].map(
                (tech) => (
                  <span key={tech} className="flex items-center">
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-devcraft-slate-dark px-8 py-[14px]">
                      {tech}
                    </span>
                    <span className="text-devcraft-border text-[10px]">·</span>
                  </span>
                )
              )}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}