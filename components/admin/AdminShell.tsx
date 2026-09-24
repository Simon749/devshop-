"use client";

import { useState } from "react";
import { Sidebar, type ViewKey } from "./Sidebar";
import { Header } from "./Header";
import { AnalyticsDashboard } from "./views/AnalyticsDashboard";
import { ManageTemplates } from "./views/ManageTemplates";
import { UploadTemplate } from "./views/UploadTemplate";

export function AdminShell() {
  const [activeView, setActiveView] = useState<ViewKey>("analytics");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-200 font-sans">
      <Sidebar
        activeView={activeView}
        onSelect={(v) => {
          setActiveView(v);
          setSidebarOpen(false);
        }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pl-64">
        <Header onBurgerClick={() => setSidebarOpen(true)} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 lg:py-10 max-w-[1600px] mx-auto">
          {activeView === "analytics" && <AnalyticsDashboard />}
          {activeView === "manage" && <ManageTemplates />}
          {activeView === "upload" && <UploadTemplate />}
        </main>
      </div>
    </div>
  );
}
