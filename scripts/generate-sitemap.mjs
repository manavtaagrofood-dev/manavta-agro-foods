import fs from 'node:fs';
import path from 'node:path';
import 'dotenv/config';

const siteUrl = (process.env.VITE_SITE_URL || '').trim().replace(/\/$/, '');
const frontendDir = path.resolve('frontend');

if (siteUrl) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n</urlset>\n`;
  fs.writeFileSync(path.join(frontendDir, 'sitemap.xml'), xml);
  fs.writeFileSync(path.join(frontendDir, 'robots.txt'), `User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /account.html\nSitemap: ${siteUrl}/sitemap.xml\n`);
  console.log(`Sitemap and robots generated for ${siteUrl}`);
} else {
  // No production domain is known in the repository. Remove stale/invalid absolute URLs
  // and let the production build regenerate both files when VITE_SITE_URL is configured.
  try { fs.unlinkSync(path.join(frontendDir, 'sitemap.xml')); } catch {}
  fs.writeFileSync(path.join(frontendDir, 'robots.txt'), 'User-agent: *\nAllow: /\nDisallow: /admin.html\nDisallow: /account.html\n');
  console.warn('VITE_SITE_URL is not set: sitemap.xml will be generated during the production build when the public site URL is configured.');
}
