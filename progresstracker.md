# DevCraft Marketplace — Build Progress Tracker

> **FOR AI AGENTS**: Read this file in full before writing any code. It tells you
> exactly what has been built, what the current task is, what decisions were made
> and why, and what to never touch. Update the status of each task as you complete it.
>
> **FOR THE DEVELOPER**: Use the checkboxes below to track your own progress.
> When you return after a session break, search for `▶ CURRENT TASK` to find
> exactly where you left off. Mark tasks `[x]` as you complete them.

---

## ◈ Project Snapshot

| Key | Value |
|-----|-------|
| **Project** | DevCraft Marketplace |
| **Stack** | Next.js 14 (App Router) · TypeScript Strict · Neon/Drizzle · Clerk · Uploadthing · Resend · M-Pesa · Paystack |
| **Deploy Target** | Vercel |
| **Markets** | Kenya (KES + M-Pesa) + Global (USD + Paystack card) |
| **Checkout Model** | Guest-only — no buyer accounts |
| **License** | Extended commercial (client projects allowed) |
| **Design Spec** | `devcraft-design-spec.docx` (always refer to this for schema and architecture) |
| **Last Updated** | _(update this date every session)_ |
| **Overall Status** | 🔴 NOT STARTED |

---

## ◈ Session Log

> Every time you (human or AI) work on this project, add an entry here.
> This prevents context loss across token resets and new chat sessions.

```
[DATE] [WHO]    — What was done this session
------------------------------------------------------------
[ not started yet ]
```

---

## ◈ Critical Decisions Log

> Architectural decisions that must never be undone without discussion.
> AI agents: treat these as hard constraints, never reverse them silently.

| # | Decision | Reason | Affects |
|---|----------|--------|---------|
| D1 | Guest-only checkout — no buyer accounts | Zero friction, higher conversion | `orders` table, checkout modal |
| D2 | ZIP keys stored in DB, NEVER returned to client | Security — files streamed server-side only | `/api/download`, all API responses |
| D3 | Download tokens are single-use + 24hr TTL | Prevents link sharing, protects revenue | `orders.token_used_at`, `/api/download` |
| D4 | `checkout_session_id` has UNIQUE DB constraint | Prevents double payments at DB level | `orders` table, checkout handler |
| D5 | Webhook handlers are idempotent | Daraja fires callbacks twice — safe replay | `/api/webhooks/mpesa`, `/api/webhooks/paystack` |
| D6 | M-Pesa callbacks confirmed via Daraja query API | Never trust callback payload alone | `/api/webhooks/mpesa` |
| D7 | Paystack webhooks validated with HMAC-SHA512 | Reject spoofed events | `/api/webhooks/paystack` |
| D8 | Admin uses Clerk, storefront has zero auth | Isolated — no shared session risk | `middleware.ts`, `/admin` routes |
| D9 | Prices stored in both `price_usd` + `price_kes` | Static, you control exchange rate manually | `templates` table |
| D10 | Templates use `slug` (not `id`) in URLs | SEO + readability | `/template/[slug]` routing |

---

## ◈ Environment Variables Status

> Check off each one when it is set in BOTH `.env.local` AND Vercel Dashboard.

### Local + Vercel Dashboard
- [ ] `DATABASE_URL`
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL`
- [ ] `UPLOADTHING_SECRET`
- [ ] `UPLOADTHING_APP_ID`
- [ ] `RESEND_API_KEY`
- [ ] `RESEND_FROM_EMAIL`
- [ ] `MPESA_CONSUMER_KEY`
- [ ] `MPESA_CONSUMER_SECRET`
- [ ] `MPESA_SHORTCODE`
- [ ] `MPESA_PASSKEY`
- [ ] `MPESA_CALLBACK_URL`
- [ ] `MPESA_ENV` (`sandbox` → switch to `production` before launch)
- [ ] `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`
- [ ] `PAYSTACK_SECRET_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `DOWNLOAD_TOKEN_SECRET`

---

## ◈ Week 1 — Foundation

**Goal**: Admin can log in, upload a ZIP file, and receive a test email. Nothing public-facing yet.

**Status**: 🔴 Not Started

---

### 1.1 — Repo & Config

- [ ] `1.1.1` Init Next.js 14 with TypeScript strict mode
  ```bash
  npx create-next-app@latest devcraft-marketplace --typescript --tailwind --eslint --app --src-dir
  ```
- [ ] `1.1.2` Configure `tsconfig.json` — set `strict: true`, add path aliases (`@/components`, `@/db`, `@/lib`, `@/services`)
- [ ] `1.1.3` Configure `next.config.js` — security headers (`X-Frame-Options`, `X-Content-Type-Options`), image domains
- [ ] `1.1.4` Create `.env.local` from template — fill in all available keys now
- [ ] `1.1.5` Create `.env.example` — placeholder values only, commit this file
- [ ] `1.1.6` Install core dependencies:
  ```bash
  npm install drizzle-orm @neondatabase/serverless drizzle-kit
  npm install @clerk/nextjs
  npm install uploadthing @uploadthing/react
  npm install resend react-email
  npm install nanoid
  npm install clsx tailwind-merge
  npx shadcn-ui@latest init
  ```

**Week 1.1 done when**: `npm run dev` starts without errors, path aliases resolve.

---

### 1.2 — Database Schema

- [ ] `1.2.1` Create `src/db/index.ts` — Neon client + Drizzle instance
- [ ] `1.2.2` Create `src/db/schema.ts` — all 3 tables: `templates`, `orders`, `subscribers`
  - `templates`: id, title, slug (UNIQUE), description, category (enum), tech_stack[], features[], price_usd, price_kes, license_type, live_preview_url, zip_file_key, screenshots[], is_published, download_count, created_at
  - `orders`: id, checkout_session_id (UNIQUE), customer_email, template_id (FK), amount_paid, currency, payment_gateway, payment_status, gateway_ref, download_token (UNIQUE), token_expires_at, token_used_at, created_at
  - `subscribers`: id, email (UNIQUE), source (enum), template_id, created_at
- [ ] `1.2.3` Create `drizzle.config.ts` pointing at Neon DB
- [ ] `1.2.4` Run `npx drizzle-kit push` — verify tables created in Neon console
- [ ] `1.2.5` Verify schema: connect via `psql $DATABASE_URL` and run `\dt` — confirm 3 tables

**Week 1.2 done when**: All 3 tables visible in Neon dashboard with correct columns.

---

### 1.3 — Clerk Admin Auth

- [ ] `1.3.1` Wrap `app/layout.tsx` with `<ClerkProvider>`
- [ ] `1.3.2` Create `src/middleware.ts` — lock all `/admin(.*)` routes; redirect non-admin email to `/`
  ```typescript
  // Only NEXT_PUBLIC_ADMIN_EMAIL can pass through /admin
  ```
- [ ] `1.3.3` Create `app/admin/layout.tsx` — basic sidebar shell (no styling needed yet)
- [ ] `1.3.4` Create `app/admin/page.tsx` — placeholder "Dashboard" heading
- [ ] `1.3.5` Test: sign in with admin email → `/admin` loads. Sign in with other email → redirected.

**Week 1.3 done when**: Non-admin users cannot reach any `/admin` route under any circumstances.

---

### 1.4 — Uploadthing File Pipeline

- [ ] `1.4.1` Create `app/api/uploadthing/core.ts` — file router with two endpoints:
  - `zipUploader`: accepts `.zip` files up to 500MB, admin-only
  - `imageUploader`: accepts `image/*` up to 4MB, admin-only
- [ ] `1.4.2` Create `app/api/uploadthing/route.ts` — Next.js route handler
- [ ] `1.4.3` Verify bucket is set to **PRIVATE** in Uploadthing dashboard
- [ ] `1.4.4` Test upload via Uploadthing dashboard — confirm file key returned, no public URL

**Week 1.4 done when**: A ZIP uploads successfully and returns a private file key (not a public URL).

---

### 1.5 — Resend Email Engine

- [ ] `1.5.1` Create `src/services/emails.ts` — Resend client setup
- [ ] `1.5.2` Create first React Email template: `emails/PurchaseConfirmation.tsx`
  - Props: `{ customerEmail, templateTitle, downloadUrl, expiresAt }`
  - Clear download button, expiry warning, /recover link
- [ ] `1.5.3` Create second React Email template: `emails/RecoverDownload.tsx`
  - Props: `{ customerEmail, templateTitle, downloadUrl, expiresAt }`
- [ ] `1.5.4` Test: call `sendPurchaseConfirmation()` manually from a test route, verify email arrives
- [ ] `1.5.5` Verify `RESEND_FROM_EMAIL` domain is verified in Resend dashboard

**Week 1.5 done when**: A test email arrives in your inbox with the correct template rendered.

---

### ✅ Week 1 Complete Checkpoint

> All of the following must be true before starting Week 2:

- [ ] `npm run dev` runs without TypeScript errors
- [ ] Admin login works, non-admin is blocked
- [ ] All 3 DB tables exist in Neon with correct schema
- [ ] ZIP upload to private Uploadthing bucket works
- [ ] Test email arrives from Resend with correct template

**🟡 Mark Week 1 Status above as `🟢 COMPLETE` when all checkboxes above are checked.**

---

## ◈ Week 2 — Storefront UI

**Goal**: Full public storefront is browsable. Checkout modal opens and collects inputs. No payment processed yet.

**Status**: 🔴 Not Started

---

### 2.1 — Core Store Components

- [ ] `2.1.1` Create `src/components/store/TemplateCard.tsx`
  - Thumbnail image, title, category badge, tech stack chips
  - Price display: shows KES if Kenyan IP, USD otherwise
  - "Free" badge for zero-price templates
  - Hover state with preview link
- [ ] `2.1.2` Create `src/components/store/FilterSidebar.tsx`
  - Filters: category, tech stack (multi-select), price (Free / Paid / All)
  - URL-param driven: filters persist on page refresh and are shareable
- [ ] `2.1.3` Create `src/components/store/ImageCarousel.tsx`
  - Screenshot slider for product detail page
  - Keyboard navigable, touch-swipeable
- [ ] `2.1.4` Create `src/components/common/Footer.tsx` and `ThemeToggle.tsx`

**2.1 done when**: Components render correctly with mock data.

---

### 2.2 — Home Page (Gallery)

- [ ] `2.2.1` Build `app/page.tsx` as a Next.js Server Component
  - Queries `templates` table directly (server-side Drizzle)
  - `revalidate: 3600` for ISR — no DB hit on every request
  - Renders `FilterSidebar` + grid of `TemplateCard`s
- [ ] `2.2.2` Implement IP-based currency detection
  - Use Vercel's `x-vercel-ip-country` header
  - Kenya (`KE`) → show KES prices + M-Pesa option
  - Everyone else → show USD prices + card option
- [ ] `2.2.3` Handle empty states: no templates published yet shows a placeholder

**2.2 done when**: Home page loads with ISR, shows template cards, filter sidebar works.

---

### 2.3 — Product Detail Page

- [ ] `2.3.1` Build `app/template/[slug]/page.tsx`
  - `generateStaticParams()` for all published templates
  - `generateMetadata()` for SEO title/description
  - ImageCarousel for screenshots
  - Feature list, tech stack badges
  - Live preview link (opens in new tab)
  - Price display with "Buy Now" / "Download Free" CTA button
- [ ] `2.3.2` CTA button opens `CheckoutModal`

**2.3 done when**: Individual product page renders correctly for a test template seeded in DB.

---

### 2.4 — Checkout Modal

- [ ] `2.4.1` Build `src/components/store/CheckoutModal.tsx`
  - Email input field (required, validated)
  - Payment method selector: M-Pesa (phone input) OR Card (Paystack)
  - M-Pesa option hidden for non-KE visitors
  - Legal checkbox: non-refund agreement (payment buttons disabled until checked)
  - Idempotency key generated here with `nanoid()` — stored in component state
  - Loading + error states
- [ ] `2.4.2` Free template flow: no payment, directly calls subscriber capture + triggers email

**2.4 done when**: Modal opens, collects email + payment method, shows correct fields per market, legal checkbox blocks submission.

---

### 2.5 — Recover Page

- [ ] `2.5.1` Build `app/recover/page.tsx`
  - Email input form
  - On submit: looks up most recent `completed` order for that email
  - If found + token not expired: resends email with existing link
  - If token expired: generates new token (reset `token_used_at`, new 24hr window)
  - If no order found: shows "no purchase found" message

**2.5 done when**: Lost download link can be recovered via email lookup.

---

### ✅ Week 2 Complete Checkpoint

- [ ] Home gallery loads via ISR with filter sidebar
- [ ] Product detail page generates static paths
- [ ] Currency detection works (KE → KES, others → USD)
- [ ] Checkout modal collects inputs correctly, legal checkbox enforced
- [ ] Free template flow works end-to-end
- [ ] /recover page finds orders by email

**🟡 Mark Week 2 Status above as `🟢 COMPLETE` when all checkboxes above are checked.**

---

## ◈ Week 3 — Payments, Webhooks & Downloads

**Goal**: Real money flows. Full purchase → email → download cycle works. Double-payment protection verified.

**Status**: 🔴 Not Started

---

### 3.1 — Token System

- [ ] `3.1.1` Create `src/lib/tokens.ts`
  - `generateDownloadToken()`: creates UUID, sets `token_expires_at = now() + 24h`
  - `validateToken(token)`: checks exists + not expired + `token_used_at` is null
  - `consumeToken(token)`: sets `token_used_at = now()`
  - `buildDownloadUrl(token)`: returns `${APP_URL}/api/download?token=${token}`

**3.1 done when**: Unit test: generate → validate → consume → validate again returns false.

---

### 3.2 — M-Pesa Integration

- [ ] `3.2.1` Create `src/lib/mpesa.ts`
  - `getAccessToken()`: OAuth2 call to Daraja, caches token until expiry
  - `initiateStkPush({ phone, amount, orderId, description })`: calls STK Push endpoint
  - `queryTransaction(checkoutRequestId)`: confirms payment status via Daraja query API
- [ ] `3.2.2` Create `app/api/checkout/mpesa/route.ts` (POST handler)
  - Validate: email, phone (format: 2547XXXXXXXX), template exists + is published
  - Generate `checkout_session_id` (nanoid) — will conflict on duplicate → return 409
  - Write pending order to DB
  - Call `initiateStkPush()` with KES amount
  - Return `{ checkoutRequestId, message: "Check your phone for M-Pesa prompt" }`
- [ ] `3.2.3` Create `app/api/webhooks/mpesa/route.ts` (POST handler)
  - Parse Daraja callback body
  - **Idempotency check**: if order already `completed`, return 200 immediately
  - If `ResultCode === 0`: call `queryTransaction()` to verify server-side
  - Update order: `payment_status = 'completed'`, `gateway_ref = MpesaReceiptNumber`
  - Call `generateDownloadToken()`, save to order
  - Call `sendPurchaseConfirmation()` via Resend
  - If `ResultCode !== 0`: mark `payment_status = 'failed'`

**3.2 done when**: Sandbox STK Push → phone shows prompt → callback fires → email received with download link.

---

### 3.3 — Paystack Integration

- [ ] `3.3.1` Create `src/lib/paystack.ts`
  - `initializeTransaction({ email, amount, currency, reference, metadata })`: calls Paystack API
  - `verifyTransaction(reference)`: server-side verification call
- [ ] `3.3.2` Create `app/api/checkout/paystack/route.ts` (POST handler)
  - Validate: email, template exists + is published
  - Generate `checkout_session_id` (nanoid) as Paystack reference
  - Write pending order to DB
  - Call `initializeTransaction()` — returns `authorization_url`
  - Return `{ authorization_url }` — frontend redirects user
- [ ] `3.3.3` Create `app/api/webhooks/paystack/route.ts` (POST handler)
  - **Validate HMAC-SHA512 signature** using `PAYSTACK_SECRET_KEY` — reject anything that fails
  - Only handle `charge.success` events
  - **Idempotency check**: if order already `completed`, return 200 immediately
  - Call `verifyTransaction(reference)` server-side to confirm amount matches
  - Update order: `payment_status = 'completed'`, `gateway_ref = reference`
  - Call `generateDownloadToken()`, save to order
  - Call `sendPurchaseConfirmation()` via Resend

**3.3 done when**: Paystack test card → redirect → webhook fires → email received with download link.

---

### 3.4 — Secure Download Endpoint

- [ ] `3.4.1` Create `app/api/download/route.ts` (GET handler)
  - Read `token` from query param
  - Call `validateToken(token)` — if invalid/expired/used: return 410 with `/recover` link
  - Fetch order from DB → get `template_id` → get `zip_file_key`
  - **Never expose `zip_file_key` in any response body**
  - Fetch ZIP binary from Uploadthing using private server-side SDK
  - Stream response with headers:
    ```
    Content-Disposition: attachment; filename="template-name.zip"
    Content-Type: application/zip
    ```
  - On successful stream: call `consumeToken(token)` + increment `templates.download_count`

**3.4 done when**: Download link streams ZIP correctly. Second click on same link returns 410.

---

### 3.5 — Double Payment Tests

- [ ] `3.5.1` Test: Click M-Pesa checkout button twice rapidly → only 1 order in DB (idempotency key collision)
- [ ] `3.5.2` Test: Send same Daraja webhook payload twice → only 1 email sent, order not double-updated
- [ ] `3.5.3` Test: Send same Paystack webhook payload twice → same result
- [ ] `3.5.4` Test: Invalid Paystack HMAC signature → 401 returned, DB untouched
- [ ] `3.5.5` Test: M-Pesa cancel (ResultCode 1032) → order marked `failed`, no email sent

**3.5 done when**: All 5 test scenarios pass.

---

### ✅ Week 3 Complete Checkpoint

- [ ] M-Pesa full flow works in sandbox
- [ ] Paystack full flow works with test card `4084084084084081`
- [ ] Download endpoint streams ZIP, second attempt returns 410
- [ ] All 5 double-payment tests pass
- [ ] /recover page regenerates expired tokens correctly

**🟡 Mark Week 3 Status above as `🟢 COMPLETE` when all checkboxes above are checked.**

---

## ◈ Week 4 — Admin Panel, Legal & Deployment

**Goal**: Admin panel fully operational. All legal guardrails in place. Site live on production domain.

**Status**: 🔴 Not Started

---

### 4.1 — Admin Dashboard

- [ ] `4.1.1` Build `app/admin/page.tsx` — revenue dashboard
  - Total revenue: all-time USD + all-time KES (separate, not converted)
  - Revenue by gateway: M-Pesa vs Paystack split
  - Revenue chart: daily bars for last 30 days (Recharts)
  - Download leaderboard: top templates by download count
  - Recent orders: last 10, with status badges
- [ ] `4.1.2` Build `src/components/admin/RevenueChart.tsx` using Recharts
  - Bar chart: x=date, y=revenue, two series (KES / USD)
  - Responsive, labeled axes
- [ ] `4.1.3` Build `src/components/admin/OrdersTable.tsx`
  - Paginated, sortable by date
  - Status badge: pending (yellow) / completed (green) / failed (red)
  - Shows: email (truncated), template, amount, gateway, date

**4.1 done when**: Dashboard shows real data from DB.

---

### 4.2 — Admin Product Management

- [ ] `4.2.1` Build `app/admin/products/page.tsx`
  - List all templates (published + drafts)
  - Toggle `is_published` without full page reload
  - Delete button (soft delete — set `is_published = false`, don't destroy orders)
  - "Add New" button → `/admin/products/new`
- [ ] `4.2.2` Build `app/admin/products/new/page.tsx`
  - `src/components/admin/TemplateUploader.tsx`
  - Fields: title, slug (auto-generated from title, editable), description, category, tech_stack[], features[], price_usd, price_kes, live_preview_url
  - ZIP dropzone → Uploadthing → stores `zip_file_key` (never displayed after save)
  - Screenshot dropzone → Uploadthing → stores keys in `screenshots[]`
  - `is_published` toggle — default false (save as draft first)
  - Form validation before submit

**4.2 done when**: New template can be created from admin panel and appears on storefront.

---

### 4.3 — Legal & Compliance

- [ ] `4.3.1` Create `app/license/page.tsx` — full extended license terms page
- [ ] `4.3.2` Create `app/privacy/page.tsx` — privacy policy (what data is collected, why)
- [ ] `4.3.3` Confirm legal checkbox is in `CheckoutModal` and payment buttons are disabled until checked
- [ ] `4.3.4` Add link to `/license` and `/privacy` in `Footer.tsx`

**4.3 done when**: Both legal pages exist and are linked from footer. Checkout blocks without consent.

---

### 4.4 — Vercel Cron Job

- [ ] `4.4.1` Create `app/api/cron/expire-tokens/route.ts`
  - Finds orders where `payment_status = 'pending'` and `created_at < now() - 15 minutes`
  - Marks them `payment_status = 'failed'`
  - Logs count of expired orders
- [ ] `4.4.2` Configure `vercel.json`:
  ```json
  {
    "crons": [{ "path": "/api/cron/expire-tokens", "schedule": "0 * * * *" }]
  }
  ```
- [ ] `4.4.3` Protect the cron route with `CRON_SECRET` header check

**4.4 done when**: Cron runs hourly and clears stuck pending orders.

---

### 4.5 — Production Deployment

- [ ] `4.5.1` Run `tsc --noEmit` — zero TypeScript errors
- [ ] `4.5.2` Run `npm run build` — zero build errors
- [ ] `4.5.3` All env vars set in Vercel Dashboard
- [ ] `4.5.4` Custom domain configured + SSL active
- [ ] `4.5.5` Switch `MPESA_ENV` from `sandbox` to `production`
- [ ] `4.5.6` Switch all Clerk, Uploadthing, Resend, Paystack keys to live/production versions
- [ ] `4.5.7` Set `MPESA_CALLBACK_URL` to production domain URL
- [ ] `4.5.8` Deploy to Vercel: `vercel --prod`
- [ ] `4.5.9` Verify Vercel Functions and Edge Middleware are active in dashboard
- [ ] `4.5.10` Verify Uploadthing bucket is PRIVATE in production dashboard

---

### 4.6 — Pre-Launch Verification

- [ ] `4.6.1` End-to-end test: M-Pesa real STK push → email → download (production keys)
- [ ] `4.6.2` End-to-end test: Paystack live card → redirect → email → download
- [ ] `4.6.3` Admin login works on production domain
- [ ] `4.6.4` Non-admin user blocked from `/admin` on production
- [ ] `4.6.5` /recover flow works on production
- [ ] `4.6.6` Expired token returns 410 + recover link on production
- [ ] `4.6.7` ZIP file has no public Uploadthing URL — direct access returns 403
- [ ] `4.6.8` Paystack webhook HMAC check active (test with wrong signature → rejected)
- [ ] `4.6.9` Legal checkbox blocks payment buttons
- [ ] `4.6.10` Vercel cron job appears in Vercel dashboard crons tab

---

### ✅ Week 4 Complete Checkpoint

- [ ] Admin dashboard shows live revenue data
- [ ] New templates can be uploaded and published from admin panel
- [ ] All legal pages exist and are linked
- [ ] Cron job configured and visible in Vercel
- [ ] All pre-launch checks passed (4.6.1 → 4.6.10)

**🟡 Mark Week 4 Status above as `🟢 COMPLETE` when all checkboxes above are checked.**

---

## ◈ Post-Launch Tracking

> Track live issues and metrics here after going live.

### Bugs Found in Production
```
[ none yet ]
```

### First Revenue
```
First sale date  : ___________
Payment method   : ___________
Template sold    : ___________
Amount           : ___________
```

### Metrics (update weekly)
| Metric | Week 1 | Week 2 | Week 3 | Week 4 |
|--------|--------|--------|--------|--------|
| Total orders | — | — | — | — |
| Completed orders | — | — | — | — |
| M-Pesa revenue (KES) | — | — | — | — |
| Paystack revenue (USD) | — | — | — | — |
| Top template | — | — | — | — |

---

## ◈ Files AI Agents Must Not Touch

> These files may only be modified if the developer explicitly requests it.

```
src/db/schema.ts          — Schema changes require a migration plan discussion first
src/middleware.ts         — Admin guard logic — any change risks opening a security hole
.env.local                — Never read or write secrets
app/api/download/route.ts — Token consumption logic is security-critical
app/api/webhooks/         — Idempotency logic must not be removed
```

---

## ◈ Quick Reference: Task ID Format

> When asking an AI to continue work, reference the task ID directly.
> Example prompt: *"Continue from task 3.2.3 — implement the M-Pesa webhook handler"*

| Week | Range | Area |
|------|-------|------|
| Week 1 | 1.1.1 → 1.5.5 | Repo, DB, Auth, Uploadthing, Email |
| Week 2 | 2.1.1 → 2.5.1 | Storefront UI, Product pages, Checkout |
| Week 3 | 3.1.1 → 3.5.5 | Payments, Webhooks, Downloads |
| Week 4 | 4.1.1 → 4.6.10 | Admin, Legal, Deployment |

---

*This file is the single source of truth for build status. Keep it updated.*