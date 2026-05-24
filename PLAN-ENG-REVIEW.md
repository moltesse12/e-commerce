# Engineering Review — MORPHO E-commerce

**Date**: 2026-05-24
**Reviewer**: plan-eng-review (agent + subagent Claude)

---

## Score: 6/10

A well-structured V1 e-commerce app with clean Supabase SSR integration and a strong design system, undermined by a broken payment webhook reconciliation path, absent error boundaries, and insufficient test coverage for critical flows.

---

## Findings

### P1 — Must fix before production

| # | Area | Finding | File |
|---|------|---------|------|
| 1 | Architecture | Webhook payment_ref mismatch: verify stores `payment_ref = String(tx.id)` (Flutterwave TX ID), webhook looks up `.eq("payment_ref", txRef)` (merchant ref `morpho-{ts}-{rand}`) — never match | `src/app/api/checkout/webhook/route.ts:31` vs `src/app/api/checkout/verify/route.ts:40` |
| 2 | Security | Webhook signature check fails open: `if (secret && signature !== secret)` — if `FLW_WEBHOOK_SECRET` env var is unset, all webhooks accepted | `src/app/api/checkout/webhook/route.ts:8` |

### P2 — Should fix before launch

| # | Area | Finding | File |
|---|------|---------|------|
| 3 | Architecture | `order_items` never created: verify endpoint inserts order but skips order_items. Order history has no line items | `src/app/api/checkout/verify/route.ts:34-50` |
| 4 | Architecture | Stock never decremented: `product_variants.stock` not reduced on payment. Over-selling risk | `src/app/api/checkout/verify/route.ts`, webhook |
| 5 | Architecture | Hardcoded customer email: Flutterwave receipts sent to `client@email.com` instead of actual user | `src/app/api/checkout/init/route.ts:31` |
| 6 | Code Quality | Morpho tag dead code: `getMorphoTag(r, null, null)` always returns null — user measurements never passed | `src/components/ReviewSection.tsx:61` |
| 7 | Code Quality | Hardcoded `isAdmin = true` in OrderStatusBadge; server gating prevents abuse but bad practice | `src/app/admin/orders/status-badge.tsx:21` |
| 8 | Testing | Only 1 test file (7 tests), covers only `matching.ts`. API routes, cart, auth, checkout: zero coverage | `src/__tests__/matching.test.ts` |

### P3 — Future improvements

| # | Area | Finding | File |
|---|------|---------|------|
| 9 | Performance | No pagination on admin pages — all orders/products loaded in one query | `src/app/admin/orders/page.tsx`, `admin/products/page.tsx` |
| 10 | Architecture | Zero `error.tsx` boundaries across 13 route segments; generic error page on failures | — |
| 11 | Code Quality | Mixed Supabase client imports: both anon (`@/lib/supabase`) and SSR (`@/lib/supabase/server`) in same files | `src/app/admin/products/page.tsx` |

---

## Architecture Diagram

```
Browser
  ├── Next.js (App Router)
  │   ├── Server Components (catalogue, admin, account)
  │   ├── Client Components (cart, checkout, auth, measurement form)
  │   └── API Routes
  │       ├── /api/checkout/init   → Flutterwave (create payment link)
  │       ├── /api/checkout/verify → Supabase (create order) + Flutterwave (verify)
  │       ├── /api/checkout/webhook → Supabase (update order) [BROKEN]
  │       └── /api/reviews        → Supabase (insert review)
  │
  ├── Supabase (PostgreSQL + Auth + RLS)
  │   ├── Categories, Products, ProductVariants (public read)
  │   ├── Orders, OrderItems (owner read, admin all)
  │   ├── Reviews (public read, owner insert)
  │   ├── UserMeasurements (owner all)
  │   └── Profiles (public read, owner write)
  │
  └── External: Flutterwave (payment gateway)
      ├── Link → Customer (redirect)
      └── Webhook → /api/checkout/webhook [BROKEN]
```

---

## Data Flow: Payment (critical path)

```
1. Checkout form → POST /api/checkout/init → Flutterwave payment link → redirect
2. Customer pays on Flutterwave
3. Flutterwave redirects to /checkout/success?tx_ref=...
4. /checkout/success → POST /api/checkout/verify
     ├── Verifies payment with Flutterwave API
     ├── Creates order in Supabase [missing: order_items]
     └── Clears cart
5. Flutterwave → POST /api/checkout/webhook [BROKEN]
     ├── W1: Signature check fails open
     ├── W2: Can't match order (payment_ref mismatch)
     └── W3: No auth context → RLS blocks update even if matched
```

---

## Outside Voice

Subagent Claude (independent architecture review) scored the codebase 6/10 and identified findings #2, #6, #7, #8, and #10.

---

## Verdict

The MVP is structurally sound for demo/seed-stage use but **cannot go to production** without fixing the webhook reconciliation path (P1 × 2). The payment flow relies entirely on the client-side verify endpoint — if the user closes the browser before /success completes, the order and payment are lost. Once architectural fixes are done, prioritize test coverage on the payment flow.
