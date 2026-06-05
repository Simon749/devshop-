export type Category = "all" | "saas" | "ecommerce" | "portfolio" | "dashboard" | "landing"

export type PriceFilter = "all" | "premium" | "free"

export interface Template {
  id: string
  title: string
  slug: string
  description: string | null
  category: Exclude<Category, "all">
  techStack: string[]
  features: string[]
  priceUsd: number
  priceKes: number
  isFree: boolean
  livePreviewUrl: string | null
  thumbnailUrl: string | null
  screenshots: string[]
  isPublished: boolean
  downloadCount: number
}

export interface Subscriber {
  id: string
  email: string
  source: "free_download" | "newsletter"
  templateId?: string
  createdAt: Date
}
