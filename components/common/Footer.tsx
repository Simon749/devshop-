"use client"

import { Zap, GitGraph, X, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-devcraft-border bg-devcraft-surface/50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-devcraft-violet" />
              <span className="font-bold text-lg text-white">Zyntric</span>
            </div>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed">
              Production-ready templates for elite developers. Built with Next.js, Tailwind, and Neon DB. 
              Ship faster, scale smarter.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-slate-400 hover:text-devcraft-violet text-sm transition-colors">Templates</a></li>
              <li><a href="#" className="text-slate-400 hover:text-devcraft-violet text-sm transition-colors">Pricing</a></li>
              <li><a href="#" className="text-slate-400 hover:text-devcraft-violet text-sm transition-colors">License</a></li>
              <li><a href="#" className="text-slate-400 hover:text-devcraft-violet text-sm transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4 text-sm">Connect</h4>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-lg bg-devcraft-card border border-devcraft-border flex items-center justify-center text-slate-400 hover:text-devcraft-violet hover:border-devcraft-violet/30 transition-all">
                <GitGraph className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-devcraft-card border border-devcraft-border flex items-center justify-center text-slate-400 hover:text-devcraft-violet hover:border-devcraft-violet/30 transition-all">
                <X className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-lg bg-devcraft-card border border-devcraft-border flex items-center justify-center text-slate-400 hover:text-devcraft-violet hover:border-devcraft-violet/30 transition-all">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-devcraft-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-xs">
            &copy; 2026 Zyntric. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">Terms</a>
            <a href="#" className="text-slate-500 hover:text-slate-300 text-xs transition-colors">License</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
