This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



// ─── NAVBAR logo (uses next/image) ───────────────────────────────────────────
// Replace your current logo block with this:

<Link href="/" className="flex items-center gap-2.5 group">
  <div className="relative w-9 h-9 rounded-full shrink-0 overflow-hidden bg-[#090d16] border border-[rgba(200,168,75,0.2)]">
    <Image
      src="/logo.png"
      alt="Zyntric Systems"
      fill
      className="object-contain scale-[1.15]"
      priority
    />
  </div>
  <div className="flex flex-col leading-none gap-[2px]">
    <span className="font-mono text-[13px] font-medium tracking-[0.1em] uppercase text-white">
      Zyntric
    </span>
    <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-[#c8a84b]">
      Systems
    </span>
  </div>
</Link>


// ─── FOOTER logo (uses background-image div) ─────────────────────────────────
// Replace your current logo block with this:

<Link href="/" className="flex items-center gap-2.5 mb-6 w-fit group">
  <div
    className="w-9 h-9 rounded-full shrink-0 border border-[rgba(200,168,75,0.2)] bg-[#090d16]"
    style={{
      backgroundImage: "url('/logo.png')",
      backgroundSize: "80%",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
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


// ─── WHY THIS WORKS ──────────────────────────────────────────────────────────
// The white fringe comes from the image having a white/light background baked
// in around the coin edges. Two changes fix it:
//
// Navbar  → object-contain (shows full coin, no crop) + bg-[#090d16] fills the
//           corners with your site bg colour. scale-[1.15] zooms the coin to
//           fill more of the circle so it doesn't look too small.
//
// Footer  → backgroundSize: "80%" + backgroundRepeat: "no-repeat" + same dark
//           bg. The coin sits centred with dark bg behind it instead of white.
//
// If the white fringe is still visible, reduce scale / backgroundSize slightly
// so the coin doesn't reach the edge of the rounded container.


