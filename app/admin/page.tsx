"use client";

import { useEffect, useState } from "react";
import { TrendingUp, DollarSign, Users, Download, Loader2 } from "lucide-react";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { OrdersTable, type OrderRow } from "@/components/admin/Orderstable";

interface StatsData {
  revenueTotals: { currency: string; gateway: string; total: string }[];
  dailyRevenue: { date: string; currency: string; total: string }[];
  topTemplates: { id: string; title: string; slug: string; downloadCount: number; category: string }[];
  recentOrders: OrderRow[];
  statusCounts: { status: string; count: string }[];
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: "emerald" | "violet" | "slate" | "amber";
}) {
  const colors = {
    emerald: "text-emerald-400",
    violet:  "text-violet-400",
    slate:   "text-slate-200",
    amber:   "text-amber-400",
  };
  return (
    <div className="p-6 rounded-2xl bg-[#0a0f1e] border border-[#1e293b] hover:border-[#2d3f5e] transition-colors">
      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
        {label}
      </div>
      <div className={`text-3xl font-bold tabular-nums ${colors[accent]}`}>{value}</div>
      {sub && <div className="text-xs text-slate-600 mt-1.5">{sub}</div>}
    </div>
  );
}

const CATEGORY_COLORS: Record<string, string> = {
  saas:      "bg-violet-900/40 text-violet-300",
  ecommerce: "bg-amber-900/40 text-amber-300",
  portfolio: "bg-cyan-900/40 text-cyan-300",
  dashboard: "bg-blue-900/40 text-blue-300",
  landing:   "bg-emerald-900/40 text-emerald-300",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Derive totals
  const totalKes = data?.revenueTotals
    .filter((r) => r.currency === "KES")
    .reduce((s, r) => s + parseFloat(r.total), 0) ?? 0;

  const totalUsd = data?.revenueTotals
    .filter((r) => r.currency === "USD")
    .reduce((s, r) => s + parseFloat(r.total), 0) ?? 0;

  const mpesaTotal = data?.revenueTotals
    .filter((r) => r.gateway === "mpesa")
    .reduce((s, r) => s + parseFloat(r.total), 0) ?? 0;

  const paystackTotal = data?.revenueTotals
    .filter((r) => r.gateway === "paystack")
    .reduce((s, r) => s + parseFloat(r.total), 0) ?? 0;

  const completedCount = data?.statusCounts.find((s) => s.status === "completed")?.count ?? "0";
  const totalOrders = data?.statusCounts.reduce((s, r) => s + parseInt(r.count), 0) ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
          <p className="text-sm text-slate-500">Loading dashboard data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Analytics Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">
          All-time revenue · live order feed · top performers
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total KES Revenue"
          value={`KES ${totalKes.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`}
          sub="M-Pesa gateway"
          accent="emerald"
        />
        <StatCard
          label="Total USD Revenue"
          value={`$${totalUsd.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
          sub="Paystack gateway"
          accent="violet"
        />
        <StatCard
          label="Completed Orders"
          value={completedCount.toString()}
          sub={`of ${totalOrders} total`}
          accent="slate"
        />
        <StatCard
          label="Gateway Split"
          value={`${mpesaTotal > 0 || paystackTotal > 0
            ? Math.round((mpesaTotal / (mpesaTotal + paystackTotal || 1)) * 100)
            : 0}% M-Pesa`}
          sub={`${Math.round((paystackTotal / (mpesaTotal + paystackTotal || 1)) * 100)}% Paystack`}
          accent="amber"
        />
      </div>

      {/* ── Revenue Chart ── */}
      {data && <RevenueChart data={data.dailyRevenue} />}

      {/* ── Bottom row: leaderboard + orders ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Download leaderboard */}
        <div className="rounded-2xl bg-[#0a0f1e] border border-[#1e293b] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1e293b]">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-500" />
              Top Templates
            </h2>
          </div>
          <ul className="divide-y divide-[#1e293b]">
            {data?.topTemplates.length === 0 && (
              <li className="px-6 py-8 text-center text-slate-600 text-sm">
                No downloads yet
              </li>
            )}
            {data?.topTemplates.map((t, i) => (
              <li key={t.id} className="px-6 py-3.5 flex items-center gap-3 hover:bg-white/[0.02] transition-colors">
                <span className="text-xl font-bold tabular-nums text-slate-700 w-6 text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{t.title}</p>
                  <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-md mt-0.5 font-medium uppercase tracking-wide ${CATEGORY_COLORS[t.category] ?? "bg-slate-800 text-slate-300"}`}>
                    {t.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-slate-200 tabular-nums">
                    {t.downloadCount.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-600">downloads</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Orders table spans 2 cols */}
        <div className="xl:col-span-2">
          {data && <OrdersTable orders={data.recentOrders} />}
        </div>
      </div>
    </div>
  );
}