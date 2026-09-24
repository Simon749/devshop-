"use client";

import { Bell, Menu, Search } from "lucide-react";

export function Header({ onBurgerClick }: { onBurgerClick: () => void }) {
  return (
    <header className="sticky top-0 z-20 h-16 bg-[#090d16]/85 backdrop-blur-xl border-b border-[#1e293b]">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <button
          onClick={onBurgerClick}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-xl border border-[#1e293b] text-slate-300 hover:text-white hover:bg-white/5"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search templates, orders, customers…"
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#0f1422] border border-[#1e293b] text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-[#8b5cf6]/50 focus:ring-2 focus:ring-[#8b5cf6]/15 transition"
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* Notifications */}
        <button className="relative h-10 w-10 grid place-items-center rounded-xl border border-[#1e293b] bg-[#0f1422] text-slate-300 hover:text-white hover:border-[#8b5cf6]/40 transition">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#10b981] text-[10px] font-semibold text-[#052e1d] grid place-items-center ring-2 ring-[#090d16]">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l border-[#1e293b]">
          <div className="hidden sm:block text-right leading-tight">
            <div className="text-sm font-medium text-white">Admin</div>
            <div className="text-[11px] text-slate-500">Host</div>
          </div>
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#10b981] grid place-items-center text-sm font-semibold text-white ring-2 ring-[#1e293b]">
              A
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#10b981] ring-2 ring-[#090d16]" />
          </div>
        </div>
      </div>
    </header>
  );
}
