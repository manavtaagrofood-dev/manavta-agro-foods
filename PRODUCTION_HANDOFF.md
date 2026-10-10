# Manavta Agro Foods — Production Handoff

## Deployment safety
The existing Render live deployment is not changed by this source package. Do not delete the live service or database. The uploaded archive's Git revision is `7b0ca6d`; the Render failed-build log was not included, so its actual root cause remains unverified. Reproduce with a clean `npm ci` and `npm run build`, then compare the first Render error.

## Render backend
Root directory: `backend` if deploying as a standalone service; alternatively use repository root with workspace command `npm run backend:start`. Build command for root/workspace deployment: `npm ci`. Start command: `npm run backend:start`. Confirm this against the current Render service settings before changing them.

Set backend variables from `.env.example` in Render Dashboard → Environment. Keep `MONGODB_URI`, `JWT_SECRET`, and `SMTP_PASS` exclusively on Render. Set `FRONTEND_ORIGIN` and `SITE_URL` to the actual Vercel deployment URL; do not use the placeholder literally.

## Gmail
Enable Google 2-Step Verification, create an App Password for the mail account, and put it in Render as `SMTP_PASS`. Never use the normal Gmail password. Do not paste credentials into chat, GitHub, Vercel, or logs.

## Vercel
Install command: `npm ci`; build command: `npm run build`; output: `dist`. Set only public frontend configuration required by the frontend (for example `VITE_API_BASE_URL`, if the app's API client uses it) to the actual Render API URL. Vite `VITE_*` variables are public. Never set SMTP credentials, Mongo URI, or JWT secret in Vercel.

## MongoDB Atlas
Use the existing database and preserve collections. Allow outbound access from Render using Atlas network access policy appropriate to your plan; avoid broad `0.0.0.0/0` unless temporarily required and explicitly accepted. Use a least-privilege database user and URL-encode special characters in its password.

## Daily report
A persistent, duplicate-safe daily report job is not yet verified in this source revision. Do not schedule `node scripts/sendDailyReport.js` until that script and a persistent report ledger are implemented and tested. Render Cron Jobs are separately billed/plan-dependent; check current Render pricing before enabling. 20:00 IST corresponds to 14:30 UTC (`30 14 * * *`).

## Verification
Run `npm ci`, `npm test`, `npm run lint`, and `npm run build` from repository root. Then test health/readiness, product API, quote/sample submission, database persistence, admin access, and SMTP using a controlled test enquiry. External Gmail delivery, Render deployment, Atlas connectivity, and Vercel production checks require account access and cannot be asserted from this archive alone.
