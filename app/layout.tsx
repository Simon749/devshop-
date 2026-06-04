import type { Metadata } from "next";
import { Instrument_Serif, DM_Mono } from "next/font/google" // Swapped Inter for a distinct Display Font
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";
import { cn } from "@/lib/utils";
import Script from "next/script";
import { ThemeProvider } from "@/components/ui/theme-provider";

// 1. Clean, functional geometric font for UI, metadata, and dashboard text
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],          // Instrument Serif only has 400
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
})

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Zyntric Marketplace — Premium Web Templates",
  description: "High-end, premium web templates tailored for modern development.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html 
        lang="en" 
        suppressHydrationWarning 
        
        className={cn("antialiased selection:bg-violet-500/20", dmMono.variable, instrumentSerif.variable)}
      >
        {/* 
          No more hardcoded inter.className! 
          By adding 'font-sans text-slate-200' to the body, everything defaults to Geist 
          while letting your display elements easily toggle over to Plus Jakarta Sans.
        */}
        <body className="font-sans bg-background text-slate-200 min-h-screen" suppressHydrationWarning>
          <ThemeProvider>
            {children}
            <Toaster position="top-right" richColors />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}