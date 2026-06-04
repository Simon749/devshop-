"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { LayoutDashboard, FolderKanban, ShoppingCart, LogOut } from "lucide-react";
import { Header } from "@/components/admin/Header"; 

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isSignedIn, isLoaded } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignOut = async () => {
    await signOut({ redirectUrl: "/" });
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-t-transparent border-accent-violet rounded-full animate-spin" />
          <div className="text-sm text-neutral-400">Verifying authorization profile...</div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: "Analytics Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Products Setup", href: "/admin/products", icon: FolderKanban },
    { name: "System Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  return (
    <div className="min-h-screen flex bg-neutral-950 text-white">
      {/* 1. Left Sidebar Navigation Panel */}
      <aside className="w-64 border-r border-neutral-900 bg-neutral-950 flex flex-col justify-between fixed h-screen z-20">
        <div>
          <div className="p-6 border-b border-neutral-900">
            <Link href="/admin" className="font-bold text-lg tracking-tight bg-gradient-to-r from-accent-violet to-accent-emerald bg-clip-text text-transparent">
              DevCraft Admin Panel
            </Link>
          </div>
          <nav className="mt-6 px-4 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-neutral-900 text-white border border-neutral-800"
                      : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* 2. Admin Quick Sign-out panel */}
        <div className="p-4 border-t border-neutral-900">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out to Store</span>
          </button>
        </div>
      </aside>

      {/* 3. Main Action Canvas Area */}
      <div className="flex-1 pl-64">
        {/* 🎯 NEST THE ADMIN HEADER SAFELY HERE */}
        <Header onBurgerClick={() => {}} />
        
        <main className="p-8 max-w-6xl mx-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}