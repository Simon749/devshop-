# Gap-Closure Checklist — Security, Trust & Scale

> Audit date: 2026-09-09
> Source: full repo review (security-critical paths read line by line)
> Rule: one source of truth for schema/enums is `schema.ts`. Status/method
> values must come from schema.ts (e.g. paymentMethodEnum = MPESA_STK,
> BANK_RECEIPT, CASH, SYSTEM — NOT "MPESA_PAYBILL", that only exists in
> the unused split enums.ts).

---

## Phase 0 — Money on the table (before anything else)

- [ ] **P0-1 M-Pesa webhook: verify before completing.** `app/api/webhooks/mpesa/route.ts` currently completes orders on unverified callback. Implement the flow in the reference section below. `queryTransaction()` already exists in `lib/mpesa.ts` — currently dead code, make it load-bearing.
- [ ] **P0-2 `fix-urls` route: add auth.** `app/api/admin/fix-urls/route.ts` has no `auth()` check. Add the same `auth()` + `role !== "admin"` guard every other admin route has.
- [ ] **P0-3 Create `middleware.ts`.** Lock `/admin(.*)` at the edge to admin role. Note: `progresstracker.md` currently lists `src/middleware.ts` as "never touch" but it doesn't exist — update that rule to "deliberate, protected file".

---

## Phase 1 — Trust & 404s (what buyers actually see)

- [ ] **P1-1 Ship `/license`, `/privacy`, `/terms` pages.** Footer links to all three; none exist. `app/sitemap.ts` actively submits `/license` and `/privacy` to Google — dead links in footer + sitemap = SEO self-harm + broken trust at the exact moment of purchase. Reuse existing policy text.
- [ ] **P1-2 Unify branding to ONE name.** Currently: storefront says "Zyntric Systems", admin/seed/env say "DevCraft". One name goes in: footer, navbar, all email templates, Paystack dashboard name (buyers see it on their bank statement), env vars, metadata.
- [ ] **P1-3 Fix footer social links.** Twitter/GitHub point to generic homepages. Point to real accounts or remove.
- [ ] **P1-4 On-page download confirmation.** Post-purchase page must immediately link to `/download/[token]` (token system already exists). Email becomes backup, not the only delivery path.
- [ ] **P1-5 Product page trust details.** Every product shows file size, format, version, update history. (Reviews/social proof = post-launch.)

---

## Phase 2 — Will break under traffic

- [ ] **P2-1 Rate limiter: in-memory → Upstash Redis.** `lib/rate-limit.ts` resets on every serverless cold start and doesn't share state across instances (near no-op on Vercel under real traffic). Swap to Upstash (free tier fine).
- [ ] **P2-2 Apply rate limiting to EVERY public POST route.** Currently only checkout/paystack is covered. Missing: both webhooks, checkout/mpesa, checkout/free, /api/recover. `checkout/free` + `/api/recover` are spam-into-someone's-inbox vectors.
- [ ] **P2-3 Stuck-order cleanup cron.** Hourly sweep: PENDING orders older than ~30 min with no callback → final `queryTransaction()` → complete if paid, else expire (use schema.ts status enum values). Add `vercel.json` cron config.
- [ ] **P2-4 Delete `services/orders.ts`.** Race-prone duplicate of the correct `lib/orders.ts`. Audit imports first.
- [ ] **P2-5 M-Pesa webhook: route completion through `lib/orders.ts`.** Currently does raw read-then-write (duplicate-delivery race). Same atomic transition Paystack uses.
- [ ] **P2-6 Security headers: add CSP + HSTS.** `next.config.ts` has X-Frame-Options / X-Content-Type-Options / Referrer-Policy but no Content-Security-Policy or Strict-Transport-Security. Budget ~1 hr to catch blocked origins from browser console.

---

## Phase 3 — Repo hygiene

- [ ] **P3-1 Remove debug scripts from repo root.** `test-*.js`, `push-db.js` → delete or move to `/scripts`.
- [ ] **P3-2 Dead code sweep.** After P0-1/P2-4, verify nothing references `services/orders.ts` and confirm `queryTransaction()` is now called.
- [ ] **P3-3 Garbage-input pass.** For every public route ask: "what happens if I POST garbage to this?" Systematic once-over catches what's left.

---

## Reference: corrected M-Pesa webhook flow (P0-1)

Principle: **the callback is a notification, not proof. Proof comes from asking Daraja directly.** Daraja does NOT sign callbacks (no HMAC like Paystack), so server-side re-query is mandatory, not optional.

1. POST /api/checkout/mpesa → Daraja password (Shortcode + Passkey + Timestamp, base64) → STK Push → receive MerchantRequestID + CheckoutRequestID → create order status=PENDING, store both IDs → return "pending" to browser.
2. Customer enters PIN on phone (Safaricom handles).
3. Safaricom POSTs result → /api/webhooks/mpesa. **Treat body as untrusted.**
4. Gate 1: does CheckoutRequestID exist in DB with status=PENDING? NO → log, return 200, stop. (Kills forged/random IDs.)
5. ResultCode !== 0 → mark failed per schema enum, done. ResultCode === 0 → do NOT complete yet, go to 6.
6. **Server-side re-verification:** call queryTransaction(CheckoutRequestID) → Daraja confirms success AND amount matches → proceed. Anything else → mark failed, never issue token.
7. Complete via lib/orders.ts atomic transition (UPDATE ... WHERE id=? AND status='PENDING'). rowCount=0 → duplicate delivery, ack 200, stop. (Makes retries harmless.)
8. Issue download token + send email. Return 200.
9. Hourly cron (see P2-3): stale PENDING sweep as final safety net for customers who never entered their PIN.

---

## Shipping order

| Days | Work |
| --- | --- |
| 1–2 | Phase 0 (M-Pesa hole loses money TODAY; fix-urls auth + middleware are ~20 min each) |
| 3–5 | Phase 1 (404s + brand split = conversion killers buyers see) |
| 6–9 | Phase 2 (rate limiting + cron needed before traffic arrives, not after) |
| 10 | Phase 3 + garbage-input pass |