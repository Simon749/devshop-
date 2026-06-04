"use client";

import { LayoutDashboard, LayersIcon, UploadCloud, X, Sparkles } from "lucide-react";

export type ViewKey = "analytics" | "manage" | "upload";

const NAV: { key: ViewKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "analytics", label: "Analytics Dashboard", icon: LayoutDashboard },
  { key: "manage", label: "Manage Templates", icon: LayersIcon },
  { key: "upload", label: "Upload New Template", icon: UploadCloud },
];

export function Sidebar({
  activeView,
  onSelect,
  open,
  onClose,
}: {
  activeView: ViewKey;
  onSelect: (v: ViewKey) => void;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col",
          "bg-[#0f1422] border-r border-[#1e293b]",
          "transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-[#1e293b]">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] grid place-items-center shadow-[0_0_20px_rgba(139,92,246,0.35)]">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold text-white tracking-tight">DevCraft</div>
              <div className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Admin</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden h-9 w-9 grid place-items-center rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          <div className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </div>
          {NAV.map(({ key, label, icon: Icon }) => {
            const active = activeView === key;
            return (
              <button
                key={key}
                onClick={() => onSelect(key)}
                className={[
                  "group relative w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                  active
                    ? "bg-[#8b5cf6]/12 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.04]",
                ].join(" ")}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.7)]" />
                )}
                <Icon
                  className={[
                    "h-[18px] w-[18px] shrink-0",
                    active ? "text-[#a78bfa]" : "text-slate-500 group-hover:text-slate-300",
                  ].join(" ")}
                />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </nav>

        {/* Admin card */}
        <div className="p-3">
          <div className="rounded-2xl border border-[#1e293b] bg-[#0b101c] p-3 flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#10b981] grid place-items-center text-sm font-semibold text-white">
                A
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-[#0b101c]" />
            </div>
            <div className="leading-tight min-w-0">
              <div className="text-sm font-medium text-white truncate">Admin</div>
              <div className="text-[11px] text-slate-500">Host · Online</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
