"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2, Download, Mail } from "lucide-react"
import Link from "next/link"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const reference = searchParams.get("reference")
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")

  useEffect(() => {
    if (!reference) {
      setStatus("error")
      setMessage("No payment reference found.")
      return
    }

    async function verify() {
      try {
        console.log("[SUCCESS PAGE] Verifying reference:", reference)
        const res = await fetch(`/api/checkout/paystack/verify?reference=${reference}`)
        const data = await res.json()

        console.log("[SUCCESS PAGE] Verify response:", res.status, data)

        // UPDATED LOGIC: Checking explicitly for data.verified as requested
        if (data.verified) {
          setStatus("success")
          setMessage(data.message || "Payment confirmed!")
          if (data.downloadUrl) {
            setDownloadUrl(data.downloadUrl)
          }
        } else {
          setStatus("error")
          setMessage(data.message || "Payment could not be verified.")
        }
      } catch (err: any) {
        console.error("[SUCCESS PAGE] Error:", err.message)
        setStatus("error")
        setMessage(err.message || "Something went wrong")
      }
    }

    verify()
  }, [reference])

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900 text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mx-auto" />
            <h1 className="text-xl font-bold">Verifying Payment...</h1>
            <p className="text-neutral-400">Please wait while we confirm your purchase.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <Download className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-neutral-400">{message}</p>
            
            {downloadUrl && (
              <a
                href={downloadUrl}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition"
              >
                <Download className="w-4 h-4" /> Download Now
              </a>
            )}

            <div className="flex items-center gap-2 text-sm text-neutral-500 justify-center">
              <Mail className="w-4 h-4" />
              <span>We've also sent a download link to your email</span>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <span className="text-2xl text-red-400">✕</span>
            </div>
            <h1 className="text-xl font-bold text-red-400">Payment Failed</h1>
            <p className="text-neutral-400">{message}</p>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition"
            >
              Back to Store
            </Link>
          </>
        )}
      </div>
    </div>
  )
}