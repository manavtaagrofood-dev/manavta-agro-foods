# Operations Runbook

## PM2

1. Install PM2 on the deployment host: `npm install -g pm2`.
2. From the repository root run: `pm2 start ecosystem.config.cjs`.
3. Verify: `pm2 status` and `pm2 logs manavta-api`.
4. Persist startup: `pm2 save` and `pm2 startup` (follow the command PM2 prints for the host OS).
5. The API exposes `/api/health` and `/api/ready`; configure the host/load balancer to restart or remove an instance when readiness fails.

## MongoDB backup

Use `ops/backup-mongodb.sh` from a secure host with `MONGODB_URI` set and `mongodump` installed. Example cron: `0 2 * * * /opt/manavta/ops/backup-mongodb.sh >> /opt/manavta/backups/backup.log 2>&1`.
For Atlas, enable continuous/cloud backups in the Atlas project as the primary production strategy and retain an independent dump when required by the business.

## Error tracking

Set `ERROR_TRACKING_WEBHOOK_URL` to a trusted centralized error collector endpoint. The API posts structured error events including request ID, route, method and stack. Do not put secrets in the URL or commit the value.

## Analytics

Set `VITE_GA4_ID` at frontend build time to enable GA4. If it is empty, no analytics script is loaded.
