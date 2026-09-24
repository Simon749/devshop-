"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteButton({ templateId, templateTitle }: { templateId: string; templateTitle: string }) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${templateTitle}"?\n\nThis will permanently remove the template and all associated files from UploadThing.`
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to delete")
      }

      router.refresh()
    } catch (err) {
      alert("Delete failed: " + (err as Error).message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm transition disabled:opacity-50 flex items-center gap-1.5"
    >
      {isDeleting ? (
        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</>
      ) : (
        <><Trash2 className="w-3.5 h-3.5" /> Delete</>
      )}
    </button>
  )
}