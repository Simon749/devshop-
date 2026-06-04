// app/admin/products/new/page.tsx — simplified version
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus } from "lucide-react"

type Category = "saas" | "ecommerce" | "portfolio" | "dashboard" | "landing"

export default function NewTemplatePage() {
  const router = useRouter()
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
    // Paste UploadThing keys here manually
    screenshotKeys: "",   // Comma-separated: key1, key2, key3
    zipKey: "",           // Single key
  })

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
      const res = await fetch("/api/admin/templates", {
        method: "POST",
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

      if (!res.ok) throw new Error("Failed to create template")
      router.push("/admin/products")
      router.refresh()
    } catch (err) {
      alert("Error: " + (err as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <h1 className="text-2xl font-bold text-white">Upload New Template</h1>
      
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
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" placeholder="e.g., Côte Royale" />
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
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" placeholder="Describe the template..." />
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
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white disabled:opacity-50" placeholder="49.00" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Price KES</label>
            <input type="number" step="0.01" value={formData.priceKes} disabled={formData.isFree}
              onChange={e => setFormData({ ...formData, priceKes: e.target.value })}
              className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white disabled:opacity-50" placeholder="6350" />
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
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" placeholder="Next.js, React, TypeScript, Tailwind CSS" />
        </div>

        {/* Features */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Features (one per line)</label>
          <textarea rows={4} value={formData.features}
            onChange={e => setFormData({ ...formData, features: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" placeholder="Cinematic GSAP animations&#10;Parallax hero&#10;Prismic CMS integration" />
        </div>

        {/* Live Preview */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Live Preview URL</label>
          <input type="url" value={formData.livePreviewUrl}
            onChange={e => setFormData({ ...formData, livePreviewUrl: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white" placeholder="https://your-template.vercel.app" />
        </div>

        {/* Screenshot Keys */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Screenshot Keys <span className="text-slate-500">(from UploadThing dashboard, comma-separated)</span>
          </label>
          <input type="text" value={formData.screenshotKeys}
            onChange={e => setFormData({ ...formData, screenshotKeys: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white font-mono text-sm" 
            placeholder="KbrwZ05QLpN6..., KbrwZ05QLpN6..." />
          <p className="text-xs text-slate-500 mt-1">Paste the file keys from your UploadThing dashboard</p>
        </div>

        {/* ZIP Key */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            ZIP File Key <span className="text-slate-500">(from UploadThing dashboard)</span>
          </label>
          <input type="text" value={formData.zipKey}
            onChange={e => setFormData({ ...formData, zipKey: e.target.value })}
            className="w-full px-4 py-2 bg-devcraft-surface border border-devcraft-border rounded-lg text-white font-mono text-sm" 
            placeholder="KbrwZ05QLpN6..." />
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-devcraft-emerald text-white font-semibold hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><Plus className="w-5 h-5" /> Create Template</>}
        </button>
      </form>
    </div>
  )
}