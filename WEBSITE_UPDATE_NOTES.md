# Website Update Notes — 15.1.0

## Included changes
- Downloadable commercial rice catalogue PDF, served from `frontend/public/downloads/` so Vite copies it to `/downloads/` during production builds.
- Catalogue download links on the homepage, product page and footer.
- Footer links to existing Privacy, Terms, Shipping and Cookie policy pages.
- Improved mobile-menu accessibility state (`aria-expanded`).
- Updated service-worker cache version and network-first navigation handling to reduce stale HTML after deployments.
- Offline banner now uses one synchronization function and is hidden whenever `navigator.onLine` reports online.
- Improved homepage meta description and relevant rice-processing keywords.
- Dependency-light sitemap generation so `npm run build` does not require the root workspace to resolve `dotenv/config`.

## Important deployment notes
1. Keep `VITE_API_URL` and `VITE_SITE_URL` configured in Vercel. The API should continue to point at the existing backend deployment.
2. Deploy the backend separately using the existing backend environment variables; this update does not require a database migration.
3. After deploying, hard-refresh the site or clear the installed PWA cache once if an old version remains visible.
4. Test a quote and sample request in production, then verify the enquiry is persisted and notification delivery is attempted.
5. Review the catalogue wording and confirm the listed specifications, packaging and contact details before using it commercially.

## Validation
- JavaScript syntax checks passed for `frontend/src/main.js`, `frontend/sw.js`, `backend/src/server.js`, `backend/src/app.js` and `scripts/generate-sitemap.mjs`.
- Full Vite build could not be completed in this environment because dependency installation did not finish and the local `vite` executable was unavailable. Run `npm ci` followed by `npm run build` in the deployment environment before publishing.


## 15.2.0 professional alignment update
- Header logo is now a single horizontally aligned brand mark; duplicate adjacent wordmark text has been removed.
- Header spacing and logo sizing are consistent across desktop, tablet and mobile breakpoints.
- Footer uses the same non-duplicated logo treatment.
- Added clear keyboard focus styling and refined sticky-header surfaces.
- Existing business workflows and backend configuration are intentionally preserved.


## V15.3 — Privacy policy and cookie preferences (10 October 2026)
- Rebuilt the Privacy Policy and Cookie Policy as responsive, branded pages.
- Added cookie notice actions: Accept all, Essential only, and Customize.
- Optional Google Analytics is only loaded after analytics consent and only if a measurement ID is configured.
- Added a footer Cookie Settings link so visitors can change preferences later.
- Legal copy reflects known website flows and providers; review it against final production settings and applicable law before treating it as legal advice or a compliance certification.
