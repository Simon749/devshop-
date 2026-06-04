"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail,
  Search,
  Loader2,
  Check,
  AlertCircle,
  ArrowLeft,
  Download,
  Clock,
} from "lucide-react"
import Link from "next/link"

type RecoverStep = "input" | "searching" | "found" | "notfound" | "error"

export default function RecoverPage() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<RecoverStep>("input")
  const [errorMessage, setErrorMessage] = useState("")
  const [orderInfo, setOrderInfo] = useState<{
    templateTitle: string
    expiresAt: string
  } | null>(null)

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address")
      return
    }

    setErrorMessage("")
    setStep("searching")

    try {
      const res = await fetch("/api/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to look up your order")
        setStep("error")
        return
      }

      if (data.found) {
        setOrderInfo({
          templateTitle: data.templateTitle,
          expiresAt: data.expiresAt,
        })
        setStep("found")
      } else {
        setStep("notfound")
      }
    } catch (err) {
      setErrorMessage("Network error. Please try again.")
      setStep("error")
    }
  }

  return (
    <div className="min-h-screen bg-devcraft-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-devcraft-violet transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-devcraft-card border border-devcraft-border rounded-2xl shadow-xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-devcraft-border">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-devcraft-violet/10 flex items-center justify-center">
                <Download className="w-5 h-5 text-devcraft-violet" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Recover Download</h1>
                <p className="text-sm text-slate-400">Lost your download link? We got you.</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {step === "input" && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-devcraft-violet" />
                      Purchase Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-4 py-3 bg-devcraft-surface border border-devcraft-border rounded-xl
                               text-white placeholder-slate-500 focus:outline-none focus:border-devcraft-violet/50
                               focus:ring-1 focus:ring-devcraft-violet/20 transition-all"
                    />
                    <p className="text-xs text-slate-500">
                      Enter the email you used during checkout. We will resend your download link.
                    </p>
                  </div>

                  <AnimatePresence>
                    {errorMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                      >
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-400">{errorMessage}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    onClick={handleSubmit}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl
                             bg-devcraft-violet text-white font-semibold text-lg
                             hover:bg-violet-600 hover:shadow-violet-glow
                             transition-all duration-200 active:scale-[0.98]"
                  >
                    <Search className="w-5 h-5" />
                    Find My Order
                  </button>
                </motion.div>
              )}

              {step === "searching" && (
                <motion.div
                  key="searching"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-12 space-y-4"
                >
                  <Loader2 className="w-8 h-8 text-devcraft-violet animate-spin mx-auto" />
                  <p className="text-slate-400">Looking up your order...</p>
                </motion.div>
              )}

              {step === "found" && (
                <motion.div
                  key="found"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-devcraft-emerald/10 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-devcraft-emerald" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Download link sent!</h3>
                    <p className="text-sm text-slate-400 mt-2">
                      We found your order for <span className="text-devcraft-violet">{orderInfo?.templateTitle}</span>
                    </p>
                    <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-500">
                      <Clock className="w-4 h-4" />
                      <span>Link expires {orderInfo?.expiresAt}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Check your inbox at <span className="text-slate-300">{email}</span>. If you don't see it, check your spam folder.
                  </p>
                  <button
                    onClick={() => {
                      setStep("input")
                      setEmail("")
                      setOrderInfo(null)
                    }}
                    className="px-6 py-3 rounded-xl bg-devcraft-surface border border-devcraft-border
                             text-slate-300 font-medium hover:text-white hover:border-devcraft-border-hover
                             transition-all duration-200"
                  >
                    Look up another order
                  </button>
                </motion.div>
              )}

              {step === "notfound" && (
                <motion.div
                  key="notfound"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-6"
                >
                  <div className="w-16 h-16 rounded-full bg-slate-500/10 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">No order found</h3>
                    <p className="text-sm text-slate-400 mt-2">
                      We couldn't find any completed orders for <span className="text-slate-300">{email}</span>
                    </p>
                  </div>
                  <div className="space-y-2 text-xs text-slate-500">
                    <p>Possible reasons:</p>
                    <ul className="space-y-1 text-left max-w-xs mx-auto">
                      <li className="flex items-start gap-2">
                        <span className="text-devcraft-violet">•</span>
                        You used a different email during checkout
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-devcraft-violet">•</span>
                        The payment hasn't completed yet
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-devcraft-violet">•</span>
                        The order was placed more than 24 hours ago
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      setStep("input")
                      setEmail("")
                    }}
                    className="px-6 py-3 rounded-xl bg-devcraft-violet text-white font-medium
                             hover:bg-violet-600 transition-all duration-200"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}

              {step === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-8 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
                    <p className="text-sm text-red-400 mt-2">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => {
                      setStep("input")
                      setErrorMessage("")
                    }}
                    className="px-6 py-3 rounded-xl bg-devcraft-violet text-white font-medium
                             hover:bg-violet-600 transition-all duration-200"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Help text */}
        <p className="text-center text-xs text-slate-600 mt-6">
          Need help? Contact support at{" "}
          <a href="mailto:support@devcraft.shop" className="text-devcraft-violet hover:underline">
            support@devcraft.shop
          </a>
        </p>
      </div>
    </div>
  )
}