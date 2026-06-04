DevCraft Marketplace
Production Design Specification
A zero-friction digital storefront for premium web templates — dual-market (Kenya + Global), guest-only checkout, M-Pesa + Paystack, fully hardened against double payments and fraud.


Attribute
Value
Framework
Next.js 14+ (App Router, TypeScript Strict)
Database
Neon Serverless PostgreSQL + Drizzle ORM
Auth
Clerk (Admin-only isolated guard)
Payments
M-Pesa Daraja API + Paystack (intl. cards)
File Storage
Uploadthing (private buckets, never public)
Email Engine
Resend + React Email templates
Hosting
Vercel (Edge + Serverless Functions)
Target Markets
Kenya (KES / M-Pesa) + Global (USD / card)
Checkout Model
Guest-only — email + secure token link
Licensing
Extended commercial license (client work allowed)
Launch Inventory
4–10 templates (mix of free lead-gen + paid)


1. System Architecture
The system is event-driven and webhook-first. The browser never touches raw file assets or payment vendor APIs directly. Every transaction is mediated by Next.js Server Actions and secured API route handlers running at the edge.

1.1 Data & Request Flow
The diagram below shows how money, files, and emails move through the system:

USER BROWSER
  |
  |--[1] Browse & filter templates (ISR-cached, zero DB hit)
  |--[2] Request checkout → POST /api/checkout/{mpesa|paystack}
  |--[3] Receive secure download link via email
  |
  v
NEXT.JS ROUTE HANDLERS  (Server-side only)
  |--[Checkout]  Generates idempotent checkout_session_id
  |              Writes pending order to Neon DB
  |              Initiates STK Push (M-Pesa) or Paystack session
  |--[Webhook]   Receives async payment confirmation
  |              Validates HMAC signature (Paystack) or confirms via Daraja (M-Pesa)
  |              Marks order 'completed' (idempotent — safe to replay)
  |              Generates download_token (UUID) + sets 24hr expiry
  |              Fires Resend email with /api/download?token= link
  |--[Download]  Validates token exists + not expired + not used
  |              Streams ZIP binary from private Uploadthing bucket
  |              Marks token as consumed (single-use)
  v
NEON POSTGRES DB  ←  single source of truth for orders, tokens, templates

1.2 Security Boundaries
Critical Security Rules
ZIP file keys are NEVER exposed to the frontend — only streamed server-side via /api/download
Download tokens are single-use UUIDs with 24-hour TTL — consumed on first successful stream
All webhook endpoints validate signatures before touching the DB (HMAC-SHA512 for Paystack, Daraja confirmation call for M-Pesa)
Idempotency keys prevent double-charges: checkout_session_id is unique-constrained in the DB
Admin routes are 100% isolated behind Clerk middleware — no shared session with storefront
Uploadthing bucket is private — no public URL exists for any asset


1.3 Double Payment & Fraud Prevention
This is the most critical operational concern. The following three-layer system prevents it:

Layer
Mechanism
1. Idempotency Key
checkout_session_id generated client-side (nanoid) and sent with checkout request. DB has UNIQUE constraint — duplicate M-Pesa button taps fail silently with a UI message.
2. Webhook Deduplication
Webhooks check payment_status before writing. If already 'completed', the handler returns 200 immediately (idempotent) without re-triggering email or token generation.
3. Token Consumption
Download tokens are marked used_at on first successful file stream. Replaying the link returns 410 Gone with a /recover redirect.


2. Repository Structure
Clean architecture: business logic (services/), DB access (db/), UI (components/), routing (app/). Never mix concerns.

devcraft-marketplace/
├── .env.local               # All secrets: DB, Clerk, Uploadthing, Resend, M-Pesa, Paystack
├── drizzle.config.ts        # Migration settings pointing at Neon DB
├── next.config.js           # Image domains, security headers, rewrites
├── package.json
├── tsconfig.json            # strict: true, paths aliases configured
└── src/
    ├── middleware.ts         # Edge-level Clerk guard: locks /admin(.*)
    ├── app/
    │   ├── layout.tsx        # Global: ClerkProvider, ThemeProvider, Toaster
    │   ├── page.tsx          # Storefront: ISR gallery with filter sidebar
    │   │
    │   ├── template/[id]/    # Product detail: carousel + preview + checkout modal
    │   │   └── page.tsx
    │   │
    │   ├── recover/          # Re-send download link (email lookup flow)
    │   │   └── page.tsx
    │   │
    │   ├── admin/            # ISOLATED DOMAIN — Clerk-protected
    │   │   ├── layout.tsx    # Admin sidebar, revenue KPIs
    │   │   ├── page.tsx      # Dashboard: revenue charts, download leaderboard
    │   │   └── products/
    │   │       ├── page.tsx  # Product list with edit/delete
    │   │       └── new/      # Upload form: ZIP + screenshots + metadata
    │   │           └── page.tsx
    │   │
    │   └── api/
    │       ├── uploadthing/  # Uploadthing callback endpoint
    │       ├── checkout/
    │       │   ├── mpesa/    # POST: STK Push initiation
    │       │   └── paystack/ # POST: Paystack session creation
    │       ├── download/     # GET ?token=: validate + stream ZIP
    │       └── webhooks/
    │           ├── mpesa/    # POST: Daraja STK callback
    │           └── paystack/ # POST: Paystack event webhook
    │
    ├── components/
    │   ├── store/
    │   │   ├── TemplateCard.tsx      # Gallery card with price badge
    │   │   ├── FilterSidebar.tsx     # Category + tech stack + price filters
    │   │   ├── CheckoutModal.tsx     # Email input + payment method selector
    │   │   └── ImageCarousel.tsx     # Screenshot slider on product page
    │   ├── admin/
    │   │   ├── RevenueChart.tsx      # Recharts bar/line: USD vs KES over time
    │   │   ├── TemplateUploader.tsx  # Uploadthing dropzone for ZIP + images
    │   │   └── OrdersTable.tsx       # Paginated orders with status badges
    │   └── common/
    │       ├── Footer.tsx
    │       ├── ThemeToggle.tsx
    │       └── TokenExpiredBanner.tsx
    │
    ├── db/
    │   ├── index.ts          # Neon client + Drizzle instance
    │   └── schema.ts         # All table definitions (single source of truth)
    │
    ├── lib/
    │   ├── mpesa.ts          # Daraja: OAuth token refresh + STK Push
    │   ├── paystack.ts       # Paystack: transaction init + verify
    │   ├── tokens.ts         # Generate / validate / consume download tokens
    │   └── utils.ts          # clsx + tailwind-merge, price formatters
    │
    └── services/
        ├── emails.ts         # Resend calls: purchase confirmation, recover
        └── orders.ts         # Idempotent order upsert logic

3. Database Schema
All tables managed via Drizzle ORM with Neon Serverless Postgres. Run drizzle-kit push to sync. Never modify production schema directly.

3.1 templates
Master product catalogue. Prices stored in both currencies (static, you set them manually).

Column
Type
Notes
id
uuid PK
gen_random_uuid() default
title
varchar(255)
Required, shown in gallery cards
slug
varchar(255)
UNIQUE — used in /template/[slug] URL
description
text
Markdown supported, rendered on product page
category
enum
'saas' | 'ecommerce' | 'portfolio' | 'dashboard' | 'landing'
tech_stack
text[]
e.g. ['Next.js', 'Tailwind', 'Framer Motion']
features
text[]
Feature bullet list shown on product page
price_usd
numeric(10,2)
0.00 = free tier; shown to global buyers
price_kes
numeric(10,2)
0.00 = free tier; shown to Kenyan buyers
license_type
enum
'extended' only (client work allowed)
live_preview_url
text
External demo link — nullable
zip_file_key
text
Uploadthing private key — NEVER sent to client
screenshots
text[]
Uploadthing public image keys for carousel
is_published
boolean
false = draft, invisible on storefront
download_count
integer
Default 0 — incremented on successful download
created_at
timestamptz
now() default


3.2 orders
Financial ledger. Immutable once status = 'completed'. The idempotency key lives here.

Column
Type
Notes
id
uuid PK
gen_random_uuid()
checkout_session_id
varchar(255)
UNIQUE constraint — prevents double writes
customer_email
varchar(255)
Required for download link delivery
template_id
uuid FK
→ templates.id ON DELETE SET NULL
amount_paid
numeric(10,2)
Actual charged amount
currency
varchar(10)
'USD' | 'KES'
payment_gateway
varchar(50)
'mpesa' | 'paystack'
payment_status
varchar(50)
'pending' | 'completed' | 'failed'
gateway_ref
varchar(255)
M-Pesa MpesaReceiptNumber or Paystack ref
download_token
uuid
UNIQUE — generated only after payment confirmed
token_expires_at
timestamptz
now() + interval '24 hours'
token_used_at
timestamptz
NULL until consumed — single-use enforcement
created_at
timestamptz
now() default


3.3 subscribers
Email list built from free downloads and opt-in newsletter signups.

Column
Type
Notes
id
uuid PK
gen_random_uuid()
email
varchar(255)
UNIQUE constraint
source
varchar(50)
'free_download' | 'newsletter'
template_id
uuid
Which template triggered the signup (nullable)
created_at
timestamptz
now() default


4. Payment Integration Details

4.1 M-Pesa (Daraja API) — Kenya Buyers
Step
What Happens
1. Initiate
POST /api/checkout/mpesa — generates idempotency key, writes pending order, calls Daraja STK Push with customer phone + amount in KES
2. Customer Action
M-Pesa PIN prompt appears on customer's phone (no redirect needed)
3. Webhook
POST /api/webhooks/mpesa — Daraja sends ResultCode. If 0 (success): confirm via query API, mark completed, generate token, send email
4. Failure
ResultCode != 0: mark failed, respond to customer with retry option. Idempotency key cleared for retry.
5. Timeout Guard
Cron job at +5 min: query Daraja for any pending orders still open. Resolve or expire.


⚠️  M-Pesa Edge Cases to Handle
Customer cancels PIN prompt → ResultCode 1032 → mark failed, allow retry
Insufficient balance → ResultCode 1 → mark failed, show clear message
Duplicate STK push from impatient user → idempotency key blocks second DB write
Webhook arrives twice (Daraja retries) → idempotent handler returns 200 on second call without re-sending email


4.2 Paystack — Global (USD / Card) Buyers
Step
What Happens
1. Initiate
POST /api/checkout/paystack — creates Paystack transaction, returns authorization_url, writes pending order with Paystack reference as checkout_session_id
2. Redirect
User redirected to Paystack hosted page (handles card, bank, mobile money)
3. Webhook
POST /api/webhooks/paystack — validate HMAC-SHA512 signature against PAYSTACK_SECRET_KEY. On charge.success: verify amount matches expected, mark completed, generate token, send email
4. Callback URL
/template/[id]?status=success — shown after redirect back (informational only, not trusted for fulfillment)
5. Verification
Always verify via Paystack API server-to-server before marking completed — never trust redirect params


5. Environment Variables
All secrets live in .env.local (never committed). Configure identically in Vercel Dashboard.

# DATABASE
DATABASE_URL=postgresql://...@neon.tech/devcraft?sslmode=require


# CLERK (Admin auth only)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_ADMIN_EMAIL=your@email.com   # only this email can access /admin


# UPLOADTHING
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...


# RESEND
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@devcraft.shop


# M-PESA (Daraja)
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_SHORTCODE=174379          # Sandbox: 174379
MPESA_PASSKEY=...
MPESA_CALLBACK_URL=https://devcraft.shop/api/webhooks/mpesa
MPESA_ENV=production             # or 'sandbox'


# PAYSTACK
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_...
PAYSTACK_SECRET_KEY=sk_live_...


# APP
NEXT_PUBLIC_APP_URL=https://devcraft.shop
DOWNLOAD_TOKEN_SECRET=<random-32-byte-hex>

6. Execution Plan — Week by Week
Four focused weeks from zero to production. Each week ends with a working, testable deliverable.

WEEK 1
Foundation: Repo, DB, Auth & File Pipeline
Init Next.js 14 with TypeScript strict mode. Configure path aliases (@/components, @/db, etc.)
Provision Neon DB. Write src/db/schema.ts (all 3 tables). Run drizzle-kit push. Verify with psql.
Install + configure Clerk. Write src/middleware.ts to lock /admin(.*). Test with non-admin email.
Set up Uploadthing. Create file router accepting .zip + image types. Test private bucket upload.
Configure Resend. Send a test email from src/services/emails.ts. Verify from address + HTML template.
Set all .env.local secrets. Commit .env.example with placeholder values (no secrets).
End of Week 1 deliverable: Admin can log in, upload a ZIP, and receive a test email.


WEEK 2
Storefront UI: Gallery, Product Pages & Checkout Modal
Build TemplateCard.tsx: thumbnail, title, price badge (USD/KES toggle), free vs paid indicator.
Build FilterSidebar.tsx: filter by category, tech stack, price range. URL-param driven (shareable).
Build home page (app/page.tsx) with ISR (revalidate: 3600). Server component queries DB directly.
Build /template/[slug] product page: screenshot carousel, feature list, tech stack badges, live preview link.
Build CheckoutModal.tsx: email field + payment method selector (M-Pesa phone OR card). Idempotency key generated here (nanoid).
Build /recover page: email input → look up most recent completed order → re-send download link.
Implement currency detection: show KES + M-Pesa by default for Kenyan IPs, USD + card for others.
End of Week 2 deliverable: Full storefront browsable. Checkout modal opens and collects inputs (no payment yet).


WEEK 3
Payments, Webhooks, Token System & Email Delivery
Implement POST /api/checkout/mpesa: Daraja OAuth token refresh + STK Push initiation.
Implement POST /api/webhooks/mpesa: parse callback, confirm via Daraja query API, idempotent order update.
Implement POST /api/checkout/paystack: create Paystack transaction, return authorization_url.
Implement POST /api/webhooks/paystack: HMAC-SHA512 validation, server-side verification, idempotent order update.
Implement token generation in src/lib/tokens.ts: UUID generation, 24hr expiry, single-use consumption.
Implement GET /api/download?token=: validate token → stream ZIP from Uploadthing → mark used_at.
Build React Email templates: purchase confirmation (with download link) + recover email.
Test full purchase flow end-to-end in sandbox: M-Pesa STK → callback → email → download.
Test double-payment protection: rapid double-tap on checkout button → only one order created.
End of Week 3 deliverable: Real money can flow. Full purchase → download cycle works.


WEEK 4
Admin Panel, Legal, Polish & Deployment
Build admin dashboard (app/admin/page.tsx): revenue totals by gateway, download leaderboard, recent orders table.
Build RevenueChart.tsx using Recharts: daily/weekly revenue bars, USD vs KES split.
Build product management pages: list all templates, publish/unpublish toggle, delete (soft).
Build TemplateUploader.tsx: Uploadthing dropzone for ZIP + screenshots, metadata form, publish toggle.
Add legal checkbox to CheckoutModal: 'I understand digital products are non-refundable upon payment confirmation.' Must be checked to enable payment buttons.
Add subscriber capture: free template downloads auto-add email to subscribers table with source='free_download'.
Configure Vercel: set all env vars, configure custom domain, enable Edge Config for feature flags.
Set up Vercel Cron: /api/cron/expire-tokens runs every hour to clean up expired pending orders.
Run full end-to-end tests: M-Pesa sandbox + Paystack test cards. Test token expiry + /recover flow.
Deploy. Monitor Vercel logs and Neon DB for first 24 hours.
End of Week 4: Production-grade site live at your domain.


7. Legal & Operational Policy

7.1 No-Refund Policy
All sales are final. Digital products are delivered instantly upon payment confirmation, waiving right of return.

Checkout modal legal checkbox text (exact wording to use):
"I understand that upon payment confirmation I will receive instant access to the purchased digital files. Due to the nature of digital products, all sales are final and non-refundable. By proceeding I waive my right to any chargeback or reversal."


7.2 Extended License Terms
All templates are sold under a single Extended Commercial License. Buyers may:
Use the template in an unlimited number of personal and client projects
Modify the source code freely
Deploy to production for commercial use
Buyers may NOT:
Resell, sublicense, or redistribute the template source code itself
Include the template in a competing template marketplace or bundle

7.3 Download Security Model
ZIP file Uploadthing keys are stored in the DB but never returned in any API response
Download happens exclusively via /api/download?token= — server streams bytes directly
Tokens expire 24 hours after issue. /recover allows regeneration with email verification.
Tokens are single-use: consumed on first successful stream (token_used_at is set)
Vercel logs all download requests with IP and user-agent for audit trail

8. Post-Launch Growth Roadmap
Ship MVP first. These are considered only after the core is stable and generating revenue.

Phase
Feature
V1.1
Bundle deals: buy 3 templates, get 20% off — implemented as discount_codes table + promo logic in checkout
V1.2
Template update notifications: customers who purchased get email when their template gets a major update
V1.3
Affiliate system: referral links with 20% commission tracked via ref= URL param → affiliates table
V1.4
Review system: buyers can leave a 1-5 star rating + text review after successful download
V2.0
Subscription tier: monthly/annual access to full catalogue (Paystack recurring or Stripe)
V2.1
Template previews: interactive StackBlitz/CodeSandbox embeds directly on product page


9. Pre-Launch Checklist
Every item must be checked before going live. No exceptions.

SECURITY
[ ] All .env secrets set in Vercel Dashboard (not just .env.local)
[ ] NEXT_PUBLIC_* vars contain nothing sensitive
[ ] Paystack webhook HMAC validation is active in production
[ ] M-Pesa callback URL points to production domain, not localhost
[ ] Uploadthing bucket is set to PRIVATE
[ ] Admin route test: non-admin user is redirected away from /admin


PAYMENTS
[ ] M-Pesa STK push tested with real phone on production shortcode
[ ] Paystack test card 4084084084084081 completes full purchase flow
[ ] Double-payment test: rapid checkout_session_id collision handled gracefully
[ ] Failed payment test: customer sees clear error + can retry


DOWNLOAD FLOW
[ ] Token expires correctly after 24 hours
[ ] Expired token returns 410 Gone + /recover link
[ ] Used token (second download attempt) returns 410 Gone
[ ] /recover page re-sends email correctly
[ ] ZIP file is not accessible via any public Uploadthing URL


LEGAL
[ ] Checkout modal has non-refund checkbox — disabled until checked
[ ] License terms page exists at /license
[ ] Privacy policy page exists at /privacy



DevCraft Marketplace — Design Specification v1.0
Build it. Ship it. Stack it.







