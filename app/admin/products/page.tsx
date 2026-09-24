import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { db } from "@/db"
import { templates } from "@/db/schema"
import { desc } from "drizzle-orm"
import { DeleteButton } from "@/components/admin/DeleteButton"

export default async function AdminProductsPage() {
  const { userId, sessionClaims } = await auth()
  const role = (sessionClaims?.metadata as { role?: string })?.role

  if (!userId || role !== "admin") redirect("/")

  const allTemplates = await db
    .select()
    .from(templates)
    .orderBy(desc(templates.createdAt))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm font-medium transition"
        >
          + New Template
        </Link>
      </div>

      {allTemplates.length === 0 ? (
        <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500 text-center">
          No templates yet. Upload your first one above.
        </div>
      ) : (
        <div className="grid gap-4">
          {allTemplates.map((t) => (
            <div key={t.id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900 flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">{t.title}</h3>
                <p className="text-sm text-neutral-500">/{t.slug} • {t.category} • ${t.priceUsd} / KES {t.priceKes}</p>
                <p className="text-xs text-neutral-600 mt-1">
                  {t.isPublished ? "Published" : "Draft"} • {t.downloadCount} downloads
                </p>
              </div>

              <div className="flex items-center gap-2">
                <DeleteButton templateId={t.id} templateTitle={t.title} />
                <Link
                  href={`/admin/products/${t.id}/edit`}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm transition"
                >
                  Edit
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}