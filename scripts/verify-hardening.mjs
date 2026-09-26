import fs from 'node:fs';
import assert from 'node:assert/strict';
import {sanitizeMongo,sanitizeText,sanitizeFreeTextBody} from '../backend/src/middleware/security-utils.js';

const checks=[];
function pass(name,fn){fn();checks.push(`PASS  ${name}`)}
pass('Mongo operator sanitization',()=>{const out=sanitizeMongo({safe:'ok',$gt:1,nested:{'$ne':2,valid:'yes'},'a.b':3});assert.deepEqual(out,{safe:'ok',nested:{valid:'yes'}})});
pass('HTML/XSS text sanitization',()=>{assert.equal(sanitizeText('<img src=x onerror=alert(1)>Hello<script>alert(1)</script>'),'Hello')});
pass('Supported free-text fields sanitized',()=>{const out=sanitizeFreeTextBody({message:'<b>Hello</b>',description:'<script>x</script>Rice',email:'a@example.com'});assert.equal(out.message,'Hello');assert.equal(out.description,'Rice');assert.equal(out.email,'a@example.com')});
const required=[
 ['explicit CSP','backend/src/app.js','contentSecurityPolicy'],
 ['short JWT default','backend/src/config/env.js',"jwtExpiresIn:process.env.JWT_EXPIRES_IN||'15m'"],
 ['refresh rotation','backend/src/utils/tokens.js','rotateRefreshToken'],
 ['account lockout','backend/src/controllers/auth.js','ACCOUNT_LOCKED'],
 ['persistent logs','backend/src/services/logger.js','LOG_RETENTION_DAYS'],
 ['error tracking hook','backend/src/services/errorTracking.js','ERROR_TRACKING_WEBHOOK_URL'],
 ['backup runbook','ops/backup-mongodb.sh','mongodump'],
 ['staging env','/.env.staging.example','NODE_ENV=staging'],
 ['admin audit API','backend/src/routes/index.js','/v1/admin/audit-logs'],
 ['admin enquiry search','backend/src/controllers/enquiries.js','filter.$or'],
 ['analytics hook','frontend/src/main.js','VITE_GA4_ID'],
 ['structured data','frontend/index.html','application/ld+json'],
];
for(const [name,file,needle] of required){const path=file.startsWith('/')?`.${file}`:file; const text=fs.readFileSync(path,'utf8'); assert.ok(text.includes(needle),`${file} missing ${needle}`);checks.push(`PASS  ${name}`)}
console.log(checks.join('\n')); console.log(`\n${checks.length} hardening checks passed.`);
