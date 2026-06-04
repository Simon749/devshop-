"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  checkoutRequestId: string
  orderId: string
}

export function MpesaPaymentStatus({ checkoutRequestId, orderId }: Props) {
  const [status, setStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [message, setMessage] = useState("Check your phone for the M-Pesa prompt")
  const router = useRouter()

  useEffect(() => {
    let interval: NodeJS.Timeout
    let timeout: NodeJS.Timeout
    let attempts = 0
    const maxAttempts = 30 // 30 * 2s = 60 seconds max

    const checkStatus = async () => {
      attempts++
      
      try {
        const res = await fetch(`/api/checkout/mpesa/status?checkoutRequestId=${checkoutRequestId}`)
        const data = await res.json()

        if (data.status === "completed") {
          setStatus("success")
          setMessage("Payment confirmed! Redirecting...")
          clearInterval(interval)
          clearTimeout(timeout)
          // Redirect to success page with download token
          router.push(`/payment/success?reference=${orderId}&gateway=mpesa`)
          return
        }

        if (data.status === "failed") {
          setStatus("failed")
          setMessage(data.message || "Payment failed. Please try again.")
          clearInterval(interval)
          clearTimeout(timeout)
          return
        }

        // Still pending — update message to reassure
        if (attempts > 5) {
          setMessage("Waiting for M-Pesa confirmation... Don't close this page.")
        }

      } catch (err) {
        console.error("Poll error:", err)
      }

      if (attempts >= maxAttempts) {
        setStatus("failed")
        setMessage("We didn't receive confirmation in time. Check your M-Pesa messages — if you were charged, contact support.")
        clearInterval(interval)
      }
    }

    // Poll every 2 seconds
    interval = setInterval(checkStatus, 2000)
    
    // Also check immediately
    checkStatus()

    // Safety cleanup
    timeout = setTimeout(() => {
      clearInterval(interval)
    }, 65000)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [checkoutRequestId, orderId, router])

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      {status === "pending" && (
        <>
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-gray-500">
            Enter your M-Pesa PIN on your phone when prompted
          </p>
        </>
      )}
      
      {status === "success" && (
        <>
          <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-green-700">{message}</p>
        </>
      )}

      {status === "failed" && (
        <>
          <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-red-700">{message}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-gray-800"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  )
}