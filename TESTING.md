# Testing — Release 14.0.0

## Automated checks

```bash
npm run verify:hardening
npm run lint
npm test
npm run test:api:smoke
npm run test:email
npm run build
npm audit --workspaces --omit=dev
```

The email test never prints the API key. With no key it prints `JETEMAIL_API_KEY not configured — email test skipped.` It sends only a transactional configuration test when credentials are present.

## Acceptance smoke test with MongoDB and JetEmail configured

1. Open the public site and select PR 114.
2. Submit a quote with invalid fields first; confirm inline errors appear beside the fields.
3. Submit a valid quote and confirm the UI shows `Enquiry Received` and an `ENQ-...` reference.
4. Confirm the MongoDB enquiry contains customer, product, requirement type, quantity, packaging, destination, status, timestamps and notification statuses.
5. Confirm JetEmail sends one customer acknowledgement and one admin email to `manavtaagrofood@gmail.com`.
6. Log into `/admin.html`; confirm the database-backed new count, enquiry list, search, pagination and submitted details.
7. Change status and confirm `ENQUIRY_STATUS_CHANGED` in Audit Trail.
8. Repeat steps 1–7 with `Request a Sample`; verify `SAMPLE` and `SAMPLE_REQUESTED`.
9. Test `/api/v1/enquiries/:id/notifications/retry` after a controlled provider failure.
10. Check 320, 375, 390, 430, 768, 1024 and 1440 CSS-pixel viewports for overflow and hidden CTAs.

A real MongoDB and JetEmail credential set are required to claim the database, authentication, admin and delivery steps as PASS.
