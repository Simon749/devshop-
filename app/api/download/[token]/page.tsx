// app/download/[token]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Download, AlertCircle, Loader2 } from "lucide-react"

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>()
  const [state, setState] = useState<"loading" | "ready" | "invalid">("loading")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetch(`/api/download/info?token=${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setTitle(data.templateTitle)
          setState("ready")
        } else {
          setMessage(data.message ?? "This link is no longer valid.")
          setState("invalid")
        }
      })
      .catch(() => {
        setMessage("Something went wrong. Please try again.")
        setState("invalid")
      })
  }, [token])

  return (
    <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 rounded-2xl border border-neutral-800 bg-neutral-900 text-center space-y-6">
        {state === "loading" && <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mx-auto" />}

        {state === "ready" && (
          <>
            <Download className="w-10 h-10 text-emerald-400 mx-auto" />
            <h1 className="text-xl font-bold">{title}</h1>
            <p className="text-neutral-400 text-sm">
              Click below to start your download. This link works once.
            </p>
            
             <a href={`/api/download?token=${token}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-medium transition">
              <Download className="w-4 h-4" /> Download Now
            </a>
          </>
        )}

        {state === "invalid" && (
          <>
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
            <h1 className="text-xl font-bold">Link no longer valid</h1>
            <p className="text-neutral-400 text-sm">{message}</p>
            <a href="/recover" className="inline-block px-6 py-3 rounded-xl border border-neutral-700 hover:bg-neutral-800 transition">
              Get a new link
            </a>
          </>
        )}
      </div>
    </main>
  )
}