# Changelog

## 15.3.0 — Privacy and cookie controls
- Expanded the Privacy Policy with collected data categories, purposes, service providers, retention, user requests, and browser storage details.
- Expanded the Cookie Policy with a clear inventory of essential browser storage, authentication cookie use, and optional analytics.
- Added a cookie notice with Accept all, Essential only, and Customize choices.
- Added a cookie preferences panel and persistent footer entry point to revise the choice.
- Gated Google Analytics loading on explicit opt-in; analytics remains disabled if no measurement ID is configured.
- Added responsive, brand-aligned styles for the consent interface and legal pages.


## 15.1.0 — 2026-10-10

- Added a downloadable commercial rice catalogue with product families, buyer specification notes, packaging formats, contact details and availability disclaimers.
- Added catalogue download links to the homepage, product catalogue and footer.
- Added footer links to Privacy, Terms, Shipping and Cookie policies.
- Improved mobile navigation accessibility with an accurate expanded/collapsed state.
- Updated the PWA cache version and made HTML navigation network-first to reduce stale page delivery after deployments.
- Clarified the offline banner so it only appears when the browser reports offline status.
- Expanded homepage metadata for relevant commercial rice searches.
- Removed the build-time dependency on resolving `dotenv/config` from the root workspace; sitemap generation now reads simple local `.env` files without relying on package hoisting.


## 14.0.0 — 2026-09-26

- Wired quote and sample requests through validation, MongoDB persistence, reference IDs, asynchronous JetEmail customer/admin notifications and admin retry.
- Added lower-case per-recipient notification status, safe provider error metadata and email idempotency keys.
- Added admin database-backed new-enquiry alert, full enquiry detail view, status transitions and audit actions.
- Replaced Resend configuration with JetEmail environment variables and verified-sender deployment documentation.
- Added focused workflow tests, API health smoke test, safe `npm run test:email` and environment-driven sitemap generation.
- Removed unsupported scale-statistic wording and kept the public content scoped to domestic supply, bulk parboiled rice, seasonal contract milling and buyer-specific processing.

## 13.0.0

- Security-hardened baseline retained: sanitization, CSP, rate limits, JWT/refresh rotation, lockout, audit logging, backups and error tracking hooks.


## 15.2.0 — Professional brand and header alignment
- Removed duplicated text next to the logo because the SVG already contains the full wordmark and tagline.
- Standardized desktop, tablet and mobile logo dimensions and alignment.
- Reworked the header surface, spacing, CTA alignment and keyboard focus states.
- Removed duplicate footer wordmark and aligned footer logo with the brand column.
- Preserved existing product, quote, sample, API and backend workflows.
