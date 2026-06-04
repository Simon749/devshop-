import { UploadCloud, FileArchive } from "lucide-react";

function Field({
  label,
  placeholder,
  prefix,
}: {
  label: string;
  placeholder: string;
  prefix?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <div className="mt-2 relative">
        {prefix && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {prefix}
          </span>
        )}
        <input
          disabled
          placeholder={placeholder}
          className={`w-full h-11 rounded-xl bg-[#0b101c] border border-[#1e293b] text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-[#8b5cf6]/50 transition ${
            prefix ? "pl-9 pr-4" : "px-4"
          }`}
        />
      </div>
    </label>
  );
}

export function UploadTemplate() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Upload New Template
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Add a new template to the DevCraft catalogue. Files are stored in a private bucket.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 rounded-2xl border border-[#1e293b] bg-[#0f1422] p-6 space-y-5">
          <h2 className="text-sm font-semibold text-white">Template details</h2>

          <Field label="Title" placeholder="e.g. Nimbus SaaS Landing" />

          <label className="block">
            <span className="text-xs font-medium text-slate-400">Description</span>
            <textarea
              disabled
              placeholder="Short pitch shown on the storefront card…"
              rows={4}
              className="mt-2 w-full rounded-xl bg-[#0b101c] border border-[#1e293b] px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-[#8b5cf6]/50 transition resize-none"
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Price (USD)" placeholder="49.00" prefix="$" />
            <Field label="Price (KES)" placeholder="6,400" prefix="KSh" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category" placeholder="SaaS · Portfolio · Ecommerce" />
            <Field label="Live preview URL" placeholder="https://demo.devcraft.dev/…" />
          </div>
        </div>

        {/* Dropzone + meta */}
        <div className="space-y-6">
          <div className="rounded-2xl border-2 border-dashed border-[#1e293b] bg-[#0f1422]/60 p-6 text-center hover:border-[#8b5cf6]/40 transition">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-[#8b5cf6]/10 grid place-items-center text-[#a78bfa]">
              <UploadCloud className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-white">Drop ZIP file here</h3>
            <p className="mt-1 text-xs text-slate-500">
              .zip up to 500 MB · streamed to private storage
            </p>
            <button className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#8b5cf6] text-white text-sm font-medium hover:bg-[#7c3aed] transition">
              Choose file
            </button>
          </div>

          <div className="rounded-2xl border border-[#1e293b] bg-[#0f1422] p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#10b981]/10 grid place-items-center text-[#10b981]">
                <FileArchive className="h-4 w-4" />
              </div>
              <div className="leading-tight">
                <div className="text-sm font-medium text-white">Extended license</div>
                <div className="text-[11px] text-slate-500">Client work allowed</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                disabled
                className="flex-1 h-10 rounded-xl bg-[#8b5cf6]/40 text-white text-sm font-medium cursor-not-allowed"
              >
                Publish
              </button>
              <button
                disabled
                className="h-10 px-4 rounded-xl border border-[#1e293b] bg-[#0b101c] text-sm text-slate-400 cursor-not-allowed"
              >
                Save draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
