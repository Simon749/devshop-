import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminOrdersPage() {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;

  if (!userId || role !== "admin") redirect("/");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-500 text-center">
        Orders will appear here once payments start flowing (Week 3).
      </div>
    </div>
  );
}