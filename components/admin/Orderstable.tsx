"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

type PaymentStatus = "pending" | "completed" | "failed" | "expired";
type PaymentGateway = "mpesa" | "paystack";

export interface OrderRow {
  id: string;
  customerEmail: string;
  amountPaid: string;
  currency: string;
  paymentGateway: PaymentGateway;
  paymentStatus: PaymentStatus;
  createdAt: string;
  templateTitle: string | null;
  templateSlug: string | null;
}

interface Props {
  orders: OrderRow[];
}

const STATUS_STYLES: Record<PaymentStatus, string> = {
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  failed:    "bg-red-500/10 text-red-400 border-red-500/20",
  expired:   "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const GATEWAY_STYLES: Record<PaymentGateway, string> = {
  mpesa:    "bg-emerald-900/30 text-emerald-300",
  paystack: "bg-violet-900/30 text-violet-300",
};

const PAGE_SIZE = 10;

type SortKey = "createdAt" | "amountPaid";
type SortDir = "asc" | "desc";

function SortIcon({ col, active, dir }: { col: string; active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />;
  return dir === "asc"
    ? <ChevronUp className="w-3.5 h-3.5 text-violet-400" />
    : <ChevronDown className="w-3.5 h-3.5 text-violet-400" />;
}

export function OrdersTable({ orders }: Props) {
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...orders].sort((a, b) => {
    let av: number, bv: number;
    if (sortKey === "createdAt") {
      av = new Date(a.createdAt).getTime();
      bv = new Date(b.createdAt).getTime();
    } else {
      av = parseFloat(a.amountPaid);
      bv = parseFloat(b.amountPaid);
    }
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const truncateEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (local.length <= 6) return email;
    return `${local.slice(0, 5)}…@${domain}`;
  };

  return (
    <div className="rounded-2xl bg-[#0a0f1e] border border-[#1e293b] overflow-hidden">
      <div className="px-6 py-4 border-b border-[#1e293b] flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Recent Orders</h2>
        <span className="text-xs text-slate-500">{orders.length} total</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e293b]">
              {[
                { label: "Customer", key: null },
                { label: "Template", key: null },
                { label: "Amount", key: "amountPaid" as SortKey },
                { label: "Gateway", key: null },
                { label: "Status", key: null },
                { label: "Date", key: "createdAt" as SortKey },
              ].map(({ label, key }) => (
                <th
                  key={label}
                  className={`px-5 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap ${key ? "cursor-pointer select-none hover:text-slate-300 transition" : ""}`}
                  onClick={() => key && toggleSort(key)}
                >
                  <span className="flex items-center gap-1.5">
                    {label}
                    {key && <SortIcon col={key} active={sortKey === key} dir={sortDir} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center text-slate-600 text-sm">
                  No orders yet
                </td>
              </tr>
            ) : (
              paginated.map((order) => (
                <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3.5 text-slate-300 font-mono text-xs">
                    {truncateEmail(order.customerEmail)}
                  </td>
                  <td className="px-5 py-3.5 text-slate-300 max-w-[160px] truncate">
                    {order.templateTitle ?? <span className="text-slate-600 italic">deleted</span>}
                  </td>
                  <td className="px-5 py-3.5 text-white font-semibold tabular-nums">
                    {order.currency === "KES" ? "KES " : "$ "}
                    {parseFloat(order.amountPaid).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wide ${GATEWAY_STYLES[order.paymentGateway]}`}>
                      {order.paymentGateway === "mpesa" ? "M-Pesa" : "Paystack"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${STATUS_STYLES[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-[#1e293b] flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#1e293b] text-slate-400 hover:text-white hover:border-[#8b5cf6]/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs rounded-lg border border-[#1e293b] text-slate-400 hover:text-white hover:border-[#8b5cf6]/40 disabled:opacity-30 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}