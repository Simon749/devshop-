"use client";

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";

interface DailyRevenue {
  date: string;
  currency: string;
  total: string;
}

interface Props {
  data: DailyRevenue[];
}

// Fill in missing dates so the chart has no gaps
function buildChartData(raw: DailyRevenue[]) {
  const map: Record<string, { date: string; KES: number; USD: number }> = {};

  // Seed last 30 days
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = { date: key, KES: 0, USD: 0 };
  }

  for (const row of raw) {
    const key = row.date.slice(0, 10);
    if (!map[key]) map[key] = { date: key, KES: 0, USD: 0 };
    if (row.currency === "KES") map[key].KES = parseFloat(row.total);
    else if (row.currency === "USD") map[key].USD = parseFloat(row.total);
  }

  return Object.values(map).map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
    }),
  }));
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0f1422] border border-[#1e293b] rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="text-slate-400 mb-2 font-medium">{label}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill }} />
          <span className="text-slate-300">
            {p.name === "KES" ? "KES " : "$ "}
            {p.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>
      ))}
    </div>
  );
};

export function RevenueChart({ data }: Props) {
  const chartData = useMemo(() => buildChartData(data), [data]);

  const hasData = chartData.some((d) => d.KES > 0 || d.USD > 0);

  return (
    <div className="rounded-2xl bg-[#0a0f1e] border border-[#1e293b] p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-white">Revenue — Last 30 Days</h2>
          <p className="text-xs text-slate-500 mt-0.5">KES (left axis) · USD (right axis)</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#10b981]" />
            M-Pesa KES
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#8b5cf6]" />
            Paystack USD
          </span>
        </div>
      </div>

      {!hasData ? (
        <div className="h-64 flex items-center justify-center text-slate-600 text-sm">
          No completed transactions yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={chartData} barGap={2} barCategoryGap="30%">
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1e293b"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            {/* Left Y-axis: KES */}
            <YAxis
              yAxisId="kes"
              orientation="left"
              tick={{ fill: "#10b981", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toString()
              }
              width={52}
            />
            {/* Right Y-axis: USD */}
            <YAxis
              yAxisId="usd"
              orientation="right"
              tick={{ fill: "#8b5cf6", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`}
              width={52}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ffffff08" }} />
            <Bar
              yAxisId="kes"
              dataKey="KES"
              name="KES"
              fill="#10b981"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              yAxisId="usd"
              dataKey="USD"
              name="USD"
              fill="#8b5cf6"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}