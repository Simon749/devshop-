"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2, X, Plus, Save } from "lucide-react"

type Category = "saas" | "ecommerce" | "portfolio" | "dashboard" | "landing"

interface Template {
  id: string
  title: string
  slug: string
  description: string | null
  category: Category
  techStack: string[]
  features: string[]
  priceUsd: string
  priceKes: string
  livePreviewUrl: string | null
  screenshots: string[]
  zipFileKey: string | null
  isPublished: boolean
}

export default function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [templateId, setTemplateId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    description: "",
    category: "landing" as Category,
    techStack: "",
    features: "",
    priceUsd: "",
    priceKes: "",
    livePreviewUrl: "",
    isFree: false,
    isPublished: true,
    screenshotKeys: "",
    zipKey: "",
  })

  // Fetch template data on mount
  useEffect(() => {
    async function load() {
      const { id } = await params
      setTemplateId(id)
      
      const res = await fetch(`/api/admin/templates/${id}`)
      if (!res.ok) {
        alert("Failed to load template")
        router.push("/admin/products")
        return
      }
      
      const template: Template = await res.json()
      
      // Convert full URLs back to keys for editing
      const screenshotKeys = (template.screenshots || [])
        .map(url => url.replace("https://utfs.io/f/", ""))
        .join(", ")

      const zipKey = template.zipFileKey 
        ? template.zipFileKey.replace("https://utfs.io/f/", "") 
        : ""

      setFormData({
        title: template.title,
        slug: template.slug,
        description: template.description || "",
        category: template.category,
        techStack: template.techStack.join(", "),
        features: template.features.join("\n"),
        priceUsd: template.priceUsd,
        priceKes: template.priceKes,
        livePreviewUrl: template.livePreviewUrl || "",
        isFree: Number(template.priceUsd) === 0 && Number(template.priceKes) === 0,
        isPublished: template.isPublished,
        screenshotKeys,
        zipKey,
      })
      
      setIsLoading(false)
    }
    
    load()
  }, [params, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Convert keys to full URLs
    const screenshots = formData.screenshotKeys
      .split(",")
      .map(k => k.trim())
      .filter(Boolean)
      .map(key => key.startsWith("http") ? key : `https://utfs.io/f/${key}`)

    try {
      const res = await fetch(`/api/admin/templates/${templateId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          slug: formData.slug,
          description: formData.description,
          category: formData.category,
          techStack: formData.techStack.split(",").map(s => s.trim()).filter(Boolean),
          features: formData.features.split("\n").map(s => s.trim()).filter(Boolean),
          priceUsd: formData.isFree ? "0" : formData.priceUsd,
          priceKes: formData.isFree ? "0" : formData.priceKes,
          livePreviewUrl: formData.livePreviewUrl || null,
          screenshots,
          zipFileKey: formData.zipKey,
          isPublished: formData.isPublished,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.message || "Failed to update template")
      }

      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      alert("Error: " + (err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Preview screenshots from keys
  const previewScreenshots = formData.screenshotKeys
    .split(",")
    .map(k => k.trim())
    .filter(Boolean)
    .map(key => key.startsWith("http") ? key : `https://utfs.io/f/${key}`)

  const canSubmit = !!formData.zipKey && previewScreenshots.length > 0 && !!formData.title && !!formData.slug && !!formData.description

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-2xl font-bold text-white">Edit Template</h1>

      <div className="p-4 bg-blue-900/20 border border-blue-600 rounded-lg text-blue-200 text-sm">
        <p className="font-medium">📤 Upload files via UploadThing Dashboard first:</p>
        <ol className="list-decimal list-inside mt-2 space-y-1 text-blue-300">
          <li>Go to <a href="https://uploadthing.com/dashboard" target="_blank" className="underline">uploadthing.com/dashboard</a></li>
          <li>Upload your screenshots → copy the file keys</li>
          <li>Upload your ZIP → copy the file key</li>
          <li>Paste the keys below</li>
        </ol>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title + Slug */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
            <input type="text" required value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })}
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Slug</label>
            <input type="text" required value={formData.slug}
              onChange={e => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
          <textarea required rows={4} value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" />
        </div>

        {/* Category + Prices */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white">
              <option value="landing">Landing Page</option>
              <option value="saas">SaaS</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="portfolio">Portfolio</option>
              <option value="dashboard">Dashboard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price USD</label>
            <input type="number" step="0.01" value={formData.priceUsd} disabled={formData.isFree}
              onChange={e => setFormData({ ...formData, priceUsd: e.target.value })}
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white disabled:opacity-50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price KES</label>
            <input type="number" step="0.01" value={formData.priceKes} disabled={formData.isFree}
              onChange={e => setFormData({ ...formData, priceKes: e.target.value })}
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white disabled:opacity-50" />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isFree}
              onChange={e => setFormData({ ...formData, isFree: e.target.checked, priceUsd: e.target.checked ? "0" : formData.priceUsd, priceKes: e.target.checked ? "0" : formData.priceKes })}
              className="w-4 h-4 rounded border-devcraft-border" />
            <span className="text-sm text-slate-300">Free Template</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isPublished}
              onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
              className="w-4 h-4 rounded border-devcraft-border" />
            <span className="text-sm text-slate-300">Published</span>
          </label>
        </div>

        {/* Tech Stack */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Tech Stack (comma separated)</label>
          <input type="text" value={formData.techStack}
            onChange={e => setFormData({ ...formData, techStack: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" />
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Features (one per line)</label>
          <textarea rows={4} value={formData.features}
            onChange={e => setFormData({ ...formData, features: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" />
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Live Preview URL</label>
          <input type="url" value={formData.livePreviewUrl}
            onChange={e => setFormData({ ...formData, livePreviewUrl: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" />
        </div>

        {/* Screenshot Keys */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Screenshot Keys <span className="text-slate-500">(comma-separated UploadThing keys)</span>
          </label>
          <input type="text" value={formData.screenshotKeys}
            onChange={e => setFormData({ ...formData, screenshotKeys: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white font-mono text-sm" 
            placeholder="KbrwZ05QLpN6..., KbrwZ05QLpN6..." />
          <p className="text-xs text-slate-500 mt-1">Paste keys from UploadThing dashboard. Existing URLs will be preserved.</p>
        </div>

        {/* Screenshot Preview */}
        {previewScreenshots.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Preview</label>
            <div className="grid grid-cols-5 gap-2">
              {previewScreenshots.map((url, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border border-devcraft-border">
                  <img src={url} alt={`Screenshot ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ZIP Key */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ZIP File Key <span className="text-slate-500">(UploadThing key)</span>
          </label>
          <input type="text" value={formData.zipKey}
            onChange={e => setFormData({ ...formData, zipKey: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white font-mono text-sm" 
            placeholder="KbrwZ05QLpN6..." />
          {formData.zipKey && (
            <p className="text-xs text-emerald-400 mt-1">✓ ZIP key set</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button type="button" onClick={() => router.push("/admin/products")} className="flex-1 px-6 py-4 rounded-xl border border-devcraft-border text-white font-semibold hover:bg-devcraft-surface transition">
            Cancel
          </button>
          <button type="submit" disabled={!canSubmit || isSubmitting} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-devcraft-emerald text-white font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </div>
      </form>
    </div>
  )
}