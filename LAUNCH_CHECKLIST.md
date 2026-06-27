# Annoture — Pre-Launch Checklist

> Not legal advice. This is a working checklist to take to your accountant/solicitor and
> to walk through before flipping on real (live-mode) payments. Items marked **[you only]**
> can't be done in code — they require you logging into an account or filing something.

---

## 1. Business & tax

- [ ] **[you only]** Registered business entity (sole trader or Ltd) with HMRC / Companies House.
      Stripe needs this to verify your account and release payouts.
- [ ] **[you only]** Business bank account connected to Stripe for payouts.
- [ ] **[you only]** Decide VAT position. UK threshold is £90k turnover, BUT selling **digital
      services to EU consumers** can create a VAT obligation from £0 — turn on **Stripe Tax**
      (or equivalent) so VAT is calculated/collected correctly per buyer location.
- [ ] Prices: terms state "GBP, exclusive of VAT where applicable" — confirm that matches how
      Stripe Tax is configured (inclusive vs exclusive) so the displayed price ≠ surprise at checkout.

## 2. Stripe (payments) — currently TEST mode

- [ ] **[you only]** Complete Stripe account activation / business verification.
- [ ] **[you only]** Recreate the Starter / Team **Price objects in LIVE mode** — the current
      ones were created in test mode and won't exist against your live key.
- [ ] **[you only]** Swap all `NEXT_PUBLIC_STRIPE_*_PRICE` env vars to the live Price IDs
      (these drive `PricingCards.tsx` → `getStripePriceId`).
- [ ] **[you only]** Swap Stripe secret/publishable keys + webhook signing secret to live values
      in the backend env.
- [ ] **[you only]** Point the live Stripe **webhook endpoint** at your production backend URL
      and confirm events (checkout completed, subscription updated/cancelled) are received.
- [ ] **[you only]** In Stripe Dashboard → Checkout settings, enable the **Terms of Service link**
      on the hosted checkout page (can't be set in code).
- [ ] End-to-end test with a real card in live mode: subscribe → invoice generated → cancel →
      downgrade to Free at period end. Then refund the test charge.

## 3. Data protection (UK GDPR)

- [ ] **[you only]** Register with the **ICO** and pay the annual data protection fee.
- [ ] **[you only]** Accept / confirm a **Data Processing Agreement** with each sub-processor:
      Stripe, Cloudflare (R2), Supabase, Vercel, Render, Sentry, Google Analytics.
- [x] Privacy policy lists what data is collected, why, lawful basis, and all sub-processors
      (incl. Cloudflare R2 — added this session).
- [ ] **[you only]** Confirm where data physically lives (Supabase region, R2 region) and that
      the privacy policy's "EU/US servers" wording is actually true for your config.
- [ ] Cookie consent banner present and analytics only load **after** consent (privacy policy
      claims this — verify it's actually wired that way, not loading GA on page load).
- [ ] Have a process to handle data subject requests (access, deletion) within 30 days —
      even if it's just a documented manual SQL/export procedure for now.

## 4. Consumer law

- [x] Terms include a clear **cancellation & refund policy**.
- [x] Terms include the **14-day right of withdrawal** for UK/EU consumers + the
      explicit-consent waiver for immediate digital-service access.
- [x] Terms & Privacy linked **before checkout** (added disclosure line under the pricing
      cards this session) and at registration.
- [ ] **[you only]** Confirm the "immediate access = waive cooling-off" waiver is genuinely
      surfaced as an explicit acknowledgement at the point of purchase, not only in the ToS body.
      (Currently it's a passive disclosure link — a solicitor may want a ticked checkbox.)

## 5. Legal docs accuracy

- [x] Privacy Policy (`qa-landing-page/app/privacy-policy`)
- [x] Terms of Service (`qa-landing-page/app/terms`)
- [x] Cookie Policy (`qa-landing-page/app/cookies`)
- [ ] **[you only]** Update the "last updated" date on Terms & Privacy (currently 14 June 2025).
- [ ] **[you only]** Confirm the legal entity name is correct throughout — Terms reference
      "Everything Creative" as IP owner; Privacy says Annoture is the controller. Make sure the
      named controller/operator matches your actual registered entity.
- [ ] **[you only]** Add a business contact address / company number if trading as a Ltd
      (required on UK business websites & invoices).

## 6. Production readiness (technical)

- [ ] All four apps deployed to production domains (app, marketing, backend, extension).
- [ ] HTTPS enforced everywhere (privacy policy claims TLS — verify).
- [ ] Production env vars set (no test keys, no localhost URLs).
- [ ] Email sending works in production (verification, password reset, billing emails).
- [ ] Error monitoring (Sentry) live and receiving events.
- [ ] Database backups configured on Supabase.
- [ ] Chrome extension submitted to / approved on the Chrome Web Store (review can take days —
      start early).
- [ ] Remove/replace the demo seed data (the "Annoture Marketing Site" board + 4 sample reports)
      before or shortly after launch if you don't want it visible on the real account.

---

### The 3 things that will actually block a real payment
1. Stripe account activated + **live-mode Price IDs** wired into env vars.
2. Live Stripe **webhook** pointing at production (otherwise subscriptions won't sync).
3. Business entity registered (Stripe verification gate).

Everything in §3 (ICO, DPAs) is legally required but won't technically stop a payment —
do it in the first days, not necessarily the first hour.
