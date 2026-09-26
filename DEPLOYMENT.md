# Deployment — Release 14.0.0

## Architecture

- Static/Vite frontend.
- Node.js + Express API.
- MongoDB/Mongoose.
- JetEmail transactional API for enquiry notifications.
- PM2 or an equivalent platform supervisor.

## Production environment

Required: `MONGODB_URI`, `JWT_SECRET`, `FRONTEND_ORIGIN`. Configure `SITE_URL` for API context and `VITE_SITE_URL` at frontend build time.

For notifications configure all four values together:

```dotenv
JETEMAIL_API_KEY=transactional_key_from_jetemail
JETEMAIL_API_URL=https://api.jetemail.com
JETEMAIL_FROM=Manavta Agro Foods <verified-address@yourdomain.com>
JETEMAIL_ADMIN_TO=manavtaagrofood@gmail.com
```

JetEmail production sending requires a verified sender/domain and the appropriate DNS records in JetEmail. Do not use a demo sender such as `onboarding@resend.dev`, and do not place the API key in source, frontend JavaScript, README files or the ZIP. The JetEmail implementation uses `POST /email` and an `Idempotency-Key` so retries do not intentionally duplicate a message.

If `REQUIRE_LEAD_NOTIFICATIONS=true`, the API refuses to start unless the JetEmail configuration is complete. Otherwise the enquiry remains saved even when a notification is skipped or fails; the admin console exposes the two statuses and the retry endpoint.

## MongoDB

Use a dedicated least-privilege database user, TLS-enabled connection string, network restrictions and backups. Run `npm run seed` from the backend workspace only against the intended environment.

## PM2

```bash
npm install -g pm2
npm run build
npm --workspace backend run start
# or use ecosystem.config.cjs
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

The API exposes `/api/health` and `/api/ready`. Readiness returns non-2xx until MongoDB is connected.

## Frontend SEO build

Set the real public URL before building:

```bash
VITE_SITE_URL=https://your-real-domain.example npm run build
```

The build generates `frontend/sitemap.xml` from that value and injects the canonical URL at runtime. Do not commit an invented production domain.

## Staging flow

1. Install dependencies and run the full verification commands.
2. Deploy with staging MongoDB and JetEmail sender credentials.
3. Exercise health/readiness, login/refresh/logout, quote, sample, admin status update, audit log and both notification paths.
4. Test 320, 375, 390, 430, 768, 1024 and 1440 CSS-pixel widths.
5. Promote the same tested artifact and deployment configuration to production.

## GitHub/Vercel safety
- Never commit `.env` or `backend/.env`; use `.env.example` as the local template.
- Configure `VITE_SITE_URL` to the final public frontend URL in Vercel so the build generates an absolute sitemap and robots sitemap directive.
- Keep MongoDB, JWT, and JetEmail secrets only in the backend host environment.
- The repository intentionally contains no live credentials.
