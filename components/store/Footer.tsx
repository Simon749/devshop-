import Link from "next/link"
import { GitBranch, X, Mail, ExternalLink } from "lucide-react"

const footerLinks = {
  Templates: [
    { label: "SaaS Templates", href: "/?category=saas" },
    { label: "Landing Pages", href: "/?category=landing" },
    { label: "Dashboards", href: "/?category=dashboard" },
    { label: "E-Commerce", href: "/?category=ecommerce" },
    { label: "Portfolio", href: "/?category=portfolio" },
  ],
  Resources: [
    { label: "Live Previews", href: "/#templates" },
    { label: "Extended License", href: "/license" },
    { label: "Recover Download", href: "/recover" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  Support: [
    { label: "Email Support", href: "mailto:hello@zyntric.dev" },
    { label: "Twitter / X", href: "https://twitter.com", external: true },
    { label: "GitHub", href: "https://github.com", external: true },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-devcraft-border bg-devcraft-bg mt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 w-fit group">
              {/* Logo coin */}
              <div
                className="w-9 h-9 rounded-full shrink-0 border border-[rgba(200,168,75,0.25)] bg-devcraft-surface"
                style={{
                  backgroundImage: "url('/logo.png')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                role="img"
                aria-label="Zyntric Systems logo"
              />
              <div className="flex flex-col leading-none gap-[2px]">
                <span className="font-mono text-[13px] font-medium tracking-[0.1em] uppercase text-white">
                  Zyntric
                </span>
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-[#c8a84b]">
                  Systems
                </span>
              </div>
            </Link>

            <p className="font-mono text-[11px] leading-[1.9] tracking-[0.01em] text-devcraft-slate-light max-w-xs mb-8 font-light">
              Production-ready Next.js and React templates for developers who
              ship fast. Extended license — use in unlimited client projects.
            </p>

            <div className="flex items-center gap-2">
              {[
                { icon: X,         href: "https://twitter.com",         label: "Twitter" },
                { icon: GitBranch, href: "https://github.com",          label: "GitHub" },
                { icon: Mail,      href: "mailto:hello@zyntric.dev",    label: "Email" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  aria-label={label}
                  className="w-8 h-8 rounded-[4px] bg-devcraft-surface border border-devcraft-border
                             flex items-center justify-center
                             text-devcraft-slate hover:text-white hover:border-devcraft-border-hover
                             transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-mono text-[9px] font-medium uppercase tracking-[0.18em] text-devcraft-slate mb-5">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      target={"external" in link && link.external ? "_blank" : undefined}
                      rel={"external" in link && link.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.02em]
                                 text-devcraft-slate-light hover:text-white
                                 transition-colors duration-200 w-fit"
                    >
                      {link.label}
                      {"external" in link && link.external && (
                        <ExternalLink className="w-3 h-3 opacity-40" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-devcraft-border">
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-devcraft-slate-dark">
            © {new Date().getFullYear()} Zyntric Systems. All rights reserved.
          </p>

          <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.08em] text-devcraft-slate-dark">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-devcraft-emerald animate-pulse" />
              M-Pesa &amp; Card
            </span>
            <span className="text-devcraft-border">·</span>
            <span>Extended License</span>
            <span className="text-devcraft-border">·</span>
            <span>Instant Download</span>
          </div>
        </div>
      </div>
    </footer>
  )
}