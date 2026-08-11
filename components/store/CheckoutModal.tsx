// components/store/CheckoutModal.tsx
"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X, Mail, Smartphone, CreditCard, Shield, AlertCircle, Loader2, Check, Sparkles, ArrowRight, Download
} from "lucide-react"
import { Template } from "@/types"
import { formatPrice } from "@/lib/utils"
import { useCurrency } from "@/components/store/CurrencyProvider"
import { nanoid } from "nanoid"

interface CheckoutModalProps {
  template: Template
  onClose: () => void
}

type PaymentMethod = "mpesa" | "paystack"
type CheckoutStep = "form" | "processing" | "mpesa_waiting" | "success" | "error"

export function CheckoutModal({ template, onClose }: CheckoutModalProps) {
  const { isKenyan } = useCurrency()
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(isKenyan ? "mpesa" : "paystack")
  const [legalChecked, setLegalChecked] = useState(false)
  const [step, setStep] = useState<CheckoutStep>("form")
  const [errorMessage, setErrorMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [idempotencyKey] = useState(() => nanoid())
  const [checkoutRequestId, setCheckoutRequestId] = useState<string>("")
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null)

  // Exchange rate state
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [rateLoading, setRateLoading] = useState(false)
  const [kesAmount, setKesAmount] = useState<number | null>(null)

  // Fetch exchange rate when M-Pesa is selected
  useEffect(() => {
    if (paymentMethod === "mpesa" && !template.isFree) {
      setRateLoading(true)
      fetch("/api/exchange-rate")
        .then(res => res.json())
        .then(data => {
          if (data.rate) {
            setExchangeRate(data.rate)
            const calculated = Math.ceil((Number(template.priceUsd || 0) * data.rate) / 10) * 10
            setKesAmount(calculated)
            console.log(`[CHECKOUT] Rate: ${data.rate}, KES Amount: ${calculated}`)
          }
        })
        .catch(err => {
          console.error("[CHECKOUT] Failed to fetch rate:", err)
          setKesAmount(Number(template.priceKes || 0))
        })
        .finally(() => setRateLoading(false))
    } else {
      setExchangeRate(null)
      setKesAmount(null)
    }
  }, [paymentMethod, template])

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [pollInterval])

  const currency = paymentMethod === "mpesa" ? "KES" : "USD"

  const displayAmount: number = paymentMethod === "mpesa" 
    ? Number(kesAmount || template.priceKes || 0) 
    : Number(template.priceUsd || 0)

  const displayCurrency = paymentMethod === "mpesa" ? "KES" : "USD"

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const validatePhone = (phone: string) => /^254[71]\d{8}$/.test(phone.replace(/\s/g, ""))

  const formatPhoneInput = (value: string) => {
    let cleaned = value.replace(/\s/g, "").replace(/\D/g, "")
    if (cleaned.startsWith("0") && cleaned.length > 1) cleaned = "254" + cleaned.slice(1)
    if (cleaned.startsWith("+")) cleaned = cleaned.slice(1)
    if (!cleaned.startsWith("254") && cleaned.startsWith("7")) cleaned = "254" + cleaned
    if (!cleaned.startsWith("254") && cleaned.startsWith("1")) cleaned = "254" + cleaned
    return cleaned
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhoneInput(e.target.value))
  }

  const startPolling = (requestId: string) => {
    let attempts = 0
    const maxAttempts = 30

    const interval = setInterval(async () => {
      attempts++

      try {
        const res = await fetch(`/api/checkout/mpesa/status?checkoutRequestId=${requestId}`)
        const statusData = await res.json()

        if (statusData.status === "completed") {
          clearInterval(interval)
          setPollInterval(null)
          setStep("success")
          return
        }

        if (statusData.status === "failed") {
          clearInterval(interval)
          setPollInterval(null)
          setErrorMessage(statusData.message || "Payment failed or was cancelled. Please try again.")
          setStep("error")
          return
        }

      } catch (err) {
        console.error("[M-PESA POLL] Error:", err)
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval)
        setPollInterval(null)
        setErrorMessage("We didn't receive confirmation in time. If you were charged, contact support.")
        setStep("error")
      }
    }, 2000)

    setPollInterval(interval)
  }

  const handleSubmit = async () => {
    if (!email || !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address")
      return
    }
    if (paymentMethod === "mpesa" && !validatePhone(phone)) {
      setErrorMessage("Please enter a valid M-Pesa number (format: 2547XXXXXXXX)")
      return
    }
    if (!legalChecked) {
      setErrorMessage("You must agree to the terms to proceed")
      return
    }

    setErrorMessage("")
    setIsLoading(true)
    setStep("processing")

    try {
      const endpoint = paymentMethod === "mpesa" ? "/api/checkout/mpesa" : "/api/checkout/paystack"
      
      const payload = {
        email,
        templateId: template.id,
        checkoutSessionId: idempotencyKey,
        ...(paymentMethod === "mpesa" && { 
          phone, 
          amount: kesAmount || Number(template.priceKes || 0)
        }),
        ...(paymentMethod === "paystack" && { 
          amount: Number(template.priceUsd || 0)
        }),
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setErrorMessage("This checkout is already in progress. Please check your email or wait a moment.")
        } else {
          setErrorMessage(data.message || "Payment initiation failed. Please try again.")
        }
        setStep("error")
        setIsLoading(false)
        return
      }

      if (paymentMethod === "paystack" && data.authorization_url) {
        window.location.href = data.authorization_url
        return
      }

      if (paymentMethod === "mpesa") {
        setCheckoutRequestId(data.checkoutRequestId)
        setStep("mpesa_waiting")
        setIsLoading(false)
        startPolling(data.checkoutRequestId)
      }
    } catch (err) {
      setErrorMessage("Network error. Please check your connection and try again.")
      setStep("error")
      setIsLoading(false)
    }
  }

  const handleFreeDownload = async () => {
    if (!email || !validateEmail(email)) {
      setErrorMessage("Please enter a valid email address")
      return
    }
    if (!legalChecked) {
      setErrorMessage("You must agree to the terms to proceed")
      return
    }

    setIsLoading(true)
    setStep("processing")

    try {
      const res = await fetch("/api/checkout/free", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, templateId: template.id, checkoutSessionId: idempotencyKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        setErrorMessage(data.message || "Failed to process download. Please try again.")
        setStep("error")
        setIsLoading(false)
        return
      }

      setStep("success")
      setIsLoading(false)
    } catch (err) {
      setErrorMessage("Network error. Please try again.")
      setStep("error")
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="relative w-full max-w-lg bg-devcraft-card border border-devcraft-border rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-devcraft-border">
          <div>
            <h2 className="text-xl font-bold text-white">{template.isFree ? "Download Free Template" : "Complete Purchase"}</h2>
            <p className="text-sm text-slate-400 mt-1">{template.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-devcraft-surface flex items-center justify-center text-slate-400 hover:text-white hover:bg-devcraft-border transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                {!template.isFree && (
                  <div className="text-center p-4 bg-devcraft-surface/50 rounded-xl border border-devcraft-border">
                    <span className="text-slate-400 text-sm">Total Amount</span>
                    <div className="text-3xl font-bold text-white mt-1">
                      {rateLoading ? (
                        <span className="text-lg animate-pulse">Calculating...</span>
                      ) : (
                        formatPrice(
                          paymentMethod === "paystack" ? Number(template.priceUsd || 0) : 0,
                          paymentMethod === "mpesa" ? Number(kesAmount || template.priceKes || 0) : 0,
                          paymentMethod === "mpesa"
                        )
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {displayCurrency} • Extended Commercial License
                      {exchangeRate && paymentMethod === "mpesa" && (
                        <span className="block text-devcraft-emerald mt-1">
                          Rate: 1 USD = {exchangeRate.toFixed(2)} KES
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-devcraft-violet" />
                    Email Address
                  </label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 bg-devcraft-surface border border-devcraft-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-devcraft-violet/50 focus:ring-1 focus:ring-devcraft-violet/20 transition-all" />
                  <p className="text-xs text-slate-500">Your download link will be sent to this email</p>
                </div>

                {!template.isFree && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setPaymentMethod("mpesa")} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${paymentMethod === "mpesa" ? "border-devcraft-emerald bg-devcraft-emerald/10 text-devcraft-emerald" : "border-devcraft-border bg-devcraft-surface text-slate-400 hover:text-slate-300"}`}>
                        <Smartphone className="w-5 h-5" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">M-Pesa</div>
                          <div className="text-xs opacity-70">Kenya</div>
                        </div>
                      </button>
                      <button onClick={() => setPaymentMethod("paystack")} className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${paymentMethod === "paystack" ? "border-devcraft-violet bg-devcraft-violet/10 text-devcraft-violet" : "border-devcraft-border bg-devcraft-surface text-slate-400 hover:text-slate-300"}`}>
                        <CreditCard className="w-5 h-5" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">Card</div>
                          <div className="text-xs opacity-70">Global</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === "mpesa" && !template.isFree && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-devcraft-emerald" />
                      M-Pesa Phone Number
                    </label>
                    <input type="tel" value={phone} onChange={handlePhoneChange} placeholder="2547XX XXX XXX" className="w-full px-4 py-3 bg-devcraft-surface border border-devcraft-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-devcraft-emerald/50 focus:ring-1 focus:ring-devcraft-emerald/20 transition-all" />
                    <p className="text-xs text-slate-500">Format: 2547XXXXXXXX (e.g., 254712345678)</p>
                  </div>
                )}

                <div className="space-y-3">
                  <label className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-200 ${legalChecked ? "border-devcraft-violet/30 bg-devcraft-violet/5" : "border-devcraft-border bg-devcraft-surface/50 hover:border-devcraft-border-hover"}`}>
                    <div className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-all ${legalChecked ? "bg-devcraft-violet border-devcraft-violet" : "border-slate-500"}`}>
                      {legalChecked && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" checked={legalChecked} onChange={(e) => setLegalChecked(e.target.checked)} className="sr-only" />
                    <span className="text-xs text-slate-400 leading-relaxed">
                      I understand that upon payment confirmation I will receive instant access to the purchased digital files. Due to the nature of digital products, all sales are final and non-refundable. By proceeding I waive my right to any chargeback or reversal.
                    </span>
                  </label>
                </div>

                <AnimatePresence>
                  {errorMessage && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-red-400">{errorMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button onClick={template.isFree ? handleFreeDownload : handleSubmit} disabled={!legalChecked || isLoading || rateLoading} className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold text-lg transition-all duration-200 active:scale-[0.98] ${template.isFree ? "bg-devcraft-emerald text-white hover:bg-emerald-600 hover:shadow-emerald-glow" : "bg-devcraft-violet text-white hover:bg-violet-600 hover:shadow-violet-glow"} ${!legalChecked || isLoading || rateLoading ? "opacity-50 cursor-not-allowed" : ""}`}>
                  {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</> : 
                   rateLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> Getting rate...</> :
                   template.isFree ? <><Download className="w-5 h-5" /> Get Free Download</> : 
                   <> Pay {displayCurrency === "KES" ? `KES ${displayAmount.toLocaleString()}` : `$${displayAmount.toFixed(2)}`} <ArrowRight className="w-5 h-5" /></>}
                </button>
              </motion.div>
            )}

            {step === "processing" && (
              <motion.div key="processing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-devcraft-violet/10 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-devcraft-violet animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{template.isFree ? "Preparing your download..." : "Processing payment..."}</h3>
                  <p className="text-sm text-slate-400 mt-2">{paymentMethod === "mpesa" && !template.isFree ? "Check your phone for the M-Pesa prompt" : "Please wait while we confirm your order"}</p>
                </div>
              </motion.div>
            )}

            {step === "mpesa_waiting" && (
              <motion.div key="mpesa_waiting" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-devcraft-emerald/10 flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-devcraft-emerald animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Check your phone</h3>
                  <p className="text-sm text-slate-400 mt-2">
                    Enter your M-PESA PIN to complete payment
                  </p>
                  <p className="text-xs text-slate-500 mt-4">
                    Don't close this window until we confirm your payment
                  </p>
                </div>
                <button 
                  onClick={() => {
                    if (pollInterval) clearInterval(pollInterval)
                    setPollInterval(null)
                    setStep("form")
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel and try again
                </button>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-devcraft-emerald/10 flex items-center justify-center mx-auto">
                  <Check className="w-8 h-8 text-devcraft-emerald" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{template.isFree ? "Download link sent!" : "Payment successful!"}</h3>
                  <p className="text-sm text-slate-400 mt-2">Check your email at <span className="text-devcraft-violet">{email}</span> for your download link. The link is valid for 24 hours.</p>
                </div>
                <button onClick={onClose} className="px-6 py-3 rounded-xl bg-devcraft-surface border border-devcraft-border text-slate-300 font-medium hover:text-white hover:border-devcraft-border-hover transition-all duration-200">Close</button>
              </motion.div>
            )}

            {step === "error" && (
              <motion.div key="error" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Something went wrong</h3>
                  <p className="text-sm text-red-400 mt-2">{errorMessage}</p>
                </div>
                <button onClick={() => { setStep("form"); setErrorMessage("") }} className="px-6 py-3 rounded-xl bg-devcraft-violet text-white font-medium hover:bg-violet-600 transition-all duration-200">Try Again</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 bg-devcraft-surface/30 border-t border-devcraft-border">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
            <Shield className="w-3 h-3" />
            <span>Secure checkout powered by {paymentMethod === "mpesa" ? "Safaricom" : "Paystack"}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}