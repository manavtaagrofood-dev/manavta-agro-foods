const BLOCKED_KEY=/^\$|\./;
export function sanitizeMongo(value, {maxDepth=8} = {}, depth=0) {
  if (depth > maxDepth) throw Object.assign(new Error('Nested input is too deep'), {statusCode:400, code:'INPUT_TOO_DEEP'});
  if (Array.isArray(value)) return value.map(v=>sanitizeMongo(v,{maxDepth},depth+1));
  if (!value || typeof value !== 'object') return value;
  const out={};
  for (const [key,val] of Object.entries(value)) {
    if (BLOCKED_KEY.test(key)) continue;
    out[key]=sanitizeMongo(val,{maxDepth},depth+1);
  }
  return out;
}
export function sanitizeText(value='') {
  return String(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi,'')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi,'')
    .replace(/<[^>]*>/g,'')
    .replace(/javascript\s*:/gi,'')
    .replace(/vbscript\s*:/gi,'')
    .replace(/data\s*:\s*text\/html/gi,'')
    .trim();
}
export function sanitizeFreeTextBody(body) {
  if (!body || typeof body !== 'object') return body;
  const fields=['firstName','lastName','company','productName','quantity','message','description','internalNotes','name','country','destination','packaging','sourcePage'];
  const out={...body};
  for (const field of fields) if (typeof out[field]==='string') out[field]=sanitizeText(out[field]);
  if (out.specifications && typeof out.specifications==='object') {
    out.specifications=Object.fromEntries(Object.entries(out.specifications).map(([k,v])=>[k,sanitizeText(v)]));
  }
  return out;
}
