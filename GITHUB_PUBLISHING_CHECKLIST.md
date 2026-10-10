# GitHub Publishing Checklist

Before making this repository public:

- [ ] Confirm you have permission to publish the full source and business materials.
- [ ] Search tracked files for real `.env` values, API keys, passwords, tokens, private URLs, and customer data.
- [ ] Keep `.env`, local databases, backups, logs, and deployment credentials out of Git.
- [ ] Confirm `.env.example` contains placeholders only.
- [ ] Run `npm ci`, `npm run lint`, `npm test`, and `npm run build`.
- [ ] Run API/email smoke tests only with controlled test data and valid test credentials.
- [ ] Review `PRODUCTION_HANDOFF.md`; it records deployment checks that require account access.
- [ ] Add a screenshot only if it contains no personal/customer information or secrets.
- [ ] Verify README links, repository name, and project description.
- [ ] Do not claim certifications, export markets, production capacity, or production-readiness unless independently confirmed.

## Git setup

```bash
git init
git add .
git status --short
# Review staged files carefully before committing.
git commit -m "Prepare Manavta Agro Foods project for GitHub"
git branch -M main
```

Add your own remote URL only after creating the destination repository.
