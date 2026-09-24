import { Plus, LayersIcon } from "lucide-react";

export function ManageTemplates() {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Manage Templates
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Browse, edit, or remove templates from your storefront.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#8b5cf6] text-white text-sm font-medium hover:bg-[#7c3aed] shadow-[0_0_24px_rgba(139,92,246,0.25)] transition">
          <Plus className="h-4 w-4" />
          New Template
        </button>
      </div>

      <div className="rounded-2xl border border-[#1e293b] bg-[#0f1422] overflow-hidden">
        <div className="grid grid-cols-[1.6fr_0.8fr_0.8fr_0.8fr_0.6fr] gap-4 px-6 py-4 border-b border-[#1e293b] bg-[#0b101c] text-[11px] uppercase tracking-[0.12em] text-slate-500">
          <div>Template</div>
          <div>Price</div>
          <div>Status</div>
          <div>Sales</div>
          <div className="text-right">Actions</div>
        </div>

        <div className="px-6 py-20 grid place-items-center">
          <div className="text-center max-w-sm">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-[#8b5cf6]/10 grid place-items-center text-[#a78bfa]">
              <LayersIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-white">No templates yet</h3>
            <p className="mt-1.5 text-sm text-slate-500">
              Upload your first template to see it listed here. You can publish, edit pricing, and
              soft-delete entries from this table.
            </p>
            <button className="mt-5 inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#1e293b] bg-[#0b101c] text-sm text-slate-300 hover:text-white hover:border-[#8b5cf6]/40 transition">
              <Plus className="h-4 w-4" />
              Upload template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
