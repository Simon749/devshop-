import {
  DollarSign,
  Coins,
  Download,
  Mail,
  TrendingUp,
  Crown,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Accent = "violet" | "emerald";

const metrics: {
  label: string;
  value: string;
  sub: string;
  delta?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: Accent;
}[] = [
  {
    label: "Total USD Revenue",
    value: "$1,240.00",
    sub: "Paid via Paystack",
    icon: DollarSign,
    accent: "violet",
  },
  {
    label: "Total KES Revenue",
    value: "KES 185,400.00",
    sub: "Paid via M-Pesa STK",
    icon: Coins,
    accent: "emerald",
  },
  {
    label: "Total Paid Downloads",
    value: "142",
    sub: "downloads delivered",
    icon: Download,
    accent: "violet",
  },
  {
    label: "Newsletter Subscribers",
    value: "489",
    sub: "leads captured",
    delta: "+12% this week",
    icon: Mail,
    accent: "emerald",
  },
];

const chartData = [
  { month: "Jan", usd: 120, kes: 18500 },
  { month: "Feb", usd: 180, kes: 22400 },
  { month: "Mar", usd: 95, kes: 15200 },
  { month: "Apr", usd: 220, kes: 27800 },
  { month: "May", usd: 310, kes: 34100 },
  { month: "Jun", usd: 265, kes: 29600 },
  { month: "Jul", usd: 340, kes: 38900 },
  { month: "Aug", usd: 410, kes: 45200 },
  { month: "Sep", usd: 380, kes: 41700 },
  { month: "Oct", usd: 470, kes: 52300 },
  { month: "Nov", usd: 525, kes: 58400 },
  { month: "Dec", usd: 610, kes: 64800 },
];

const leaderboard: {
  name: string;
  category: "SaaS" | "E-commerce" | "Portfolio";
  downloads: number;
  revenue: string;
}[] = [
  { name: "Nimbus SaaS Kit", category: "SaaS", downloads: 38, revenue: "$1,862.00" },
  { name: "Atelier Storefront", category: "E-commerce", downloads: 27, revenue: "$1,323.00" },
  { name: "Lumen Portfolio Pro", category: "Portfolio", downloads: 24, revenue: "$960.00" },
  { name: "Helix Admin Console", category: "SaaS", downloads: 19, revenue: "$1,140.00" },
  { name: "Marble Commerce", category: "E-commerce", downloads: 17, revenue: "$833.00" },
  { name: "Vellum Folio", category: "Portfolio", downloads: 14, revenue: "$420.00" },
];

const categoryStyle: Record<string, { bg: string; color: string }> = {
  SaaS: { bg: "rgba(139,92,246,0.12)", color: "#a78bfa" },
  "E-commerce": { bg: "rgba(16,185,129,0.12)", color: "#34d399" },
  Portfolio: { bg: "rgba(244,114,182,0.12)", color: "#f472b6" },
};

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const usd = payload.find((p: any) => p.dataKey === "usd")?.value ?? 0;
  const kes = payload.find((p: any) => p.dataKey === "kes")?.value ?? 0;
  return (
    <div className="rounded-xl border border-[#1e293b] bg-[#0b101c]/95 backdrop-blur-xl px-3.5 py-2.5 shadow-2xl">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-2 space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
          <span className="text-slate-400">USD</span>
          <span className="ml-auto font-medium text-white">${usd.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-[#10b981]" />
          <span className="text-slate-400">KES</span>
          <span className="ml-auto font-medium text-white">{kes.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
          Welcome back, <span className="text-[#a78bfa]">Admin</span>
        </h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Here's what's happening across your marketplace today.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map(({ label, value, sub, delta, icon: Icon, accent }) => {
          const color = accent === "violet" ? "#8b5cf6" : "#10b981";
          return (
            <div
              key={label}
              className="group relative rounded-2xl border border-[#1e293b] bg-[#0f1422] p-5 transition-all duration-300 hover:border-transparent"
              style={
                {
                  ["--glow" as any]: color,
                } as React.CSSProperties
              }
            >
              {/* Glow ring on hover */}
              <div
                className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow: `0 0 0 1px ${color}66, 0 0 32px -4px ${color}66, inset 0 0 24px -8px ${color}33`,
                }}
              />
              <div className="relative flex items-start justify-between">
                <div
                  className="h-10 w-10 rounded-xl grid place-items-center"
                  style={{ backgroundColor: `${color}1a`, color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                {delta && (
                  <span
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}1a`, color }}
                  >
                    <TrendingUp className="h-3 w-3" />
                    {delta}
                  </span>
                )}
              </div>
              <div className="relative mt-5">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">
                  {label}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white tracking-tight">
                  {value}
                </div>
                <div className="mt-1 text-xs text-slate-500">{sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#0f1422] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Sales Trends</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              USD (Paystack) vs KES (M-Pesa) across the year
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#8b5cf6] shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
              <span className="text-slate-400">USD (Paystack)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-slate-400">KES (M-Pesa)</span>
            </div>
          </div>
        </div>

        <div className="mt-6 h-80 -ml-3">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="usdFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="kesFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="month"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                yAxisId="usd"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(v) => `$${v}`}
              />
              <YAxis
                yAxisId="kes"
                orientation="right"
                stroke="#475569"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: "#8b5cf6", strokeOpacity: 0.3, strokeWidth: 1 }}
              />
              <Area
                yAxisId="usd"
                type="monotone"
                dataKey="usd"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                fill="url(#usdFill)"
                activeDot={{ r: 5, fill: "#8b5cf6", stroke: "#0f1422", strokeWidth: 2 }}
              />
              <Area
                yAxisId="kes"
                type="monotone"
                dataKey="kes"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#kesFill)"
                activeDot={{ r: 5, fill: "#10b981", stroke: "#0f1422", strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="rounded-2xl border border-[#1e293b] bg-[#0f1422] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#1e293b]">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#8b5cf6]/10 grid place-items-center text-[#a78bfa]">
              <Crown className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Top Downloaded Templates</h2>
              <p className="text-xs text-slate-500 mt-0.5">Ranked by total downloads this period</p>
            </div>
          </div>
          <button className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#0b101c] text-[11px] uppercase tracking-[0.12em] text-slate-500">
                <th className="text-left font-medium px-6 py-3 w-12">#</th>
                <th className="text-left font-medium px-6 py-3">Template</th>
                <th className="text-left font-medium px-6 py-3">Category</th>
                <th className="text-right font-medium px-6 py-3">Downloads</th>
                <th className="text-right font-medium px-6 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, idx) => {
                const cat = categoryStyle[row.category];
                const rank = idx + 1;
                return (
                  <tr
                    key={row.name}
                    className="border-t border-[#1e293b] hover:bg-white/[0.02] transition"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={[
                          "inline-grid place-items-center h-7 w-7 rounded-lg text-xs font-semibold",
                          rank === 1
                            ? "bg-[#8b5cf6]/15 text-[#a78bfa] ring-1 ring-[#8b5cf6]/40"
                            : rank === 2
                              ? "bg-[#10b981]/12 text-[#34d399]"
                              : "bg-[#0b101c] text-slate-500",
                        ].join(" ")}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#1e293b] to-[#0b101c] border border-[#1e293b] grid place-items-center text-xs font-semibold text-slate-300">
                          {row.name
                            .split(" ")
                            .map((w) => w[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="font-medium text-white">{row.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: cat.bg, color: cat.color }}
                      >
                        {row.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-slate-300 tabular-nums">
                      {row.downloads}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-white tabular-nums">
                      {row.revenue}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
