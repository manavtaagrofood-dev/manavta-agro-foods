const CACHE='manavta-shell-v16';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./images/product-hero.webp','./images/pr114.webp','./images/pr126.webp','./images/basmati1121.webp','./images/regional-basmati.webp','./images/bulk-parboiled.webp','./images/custom-milling.webp','./images/manavta-logo.svg','./images/product-placeholder.svg','/downloads/manavta-commercial-rice-catalogue.pdf'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('manavta-shell-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const request=event.request; const u=new URL(request.url);
  if(request.method!=='GET'||u.pathname.includes('/api/'))return;
  if(u.origin!==location.origin)return;
  // Always try fresh HTML first; use cache only as an offline fallback.
  if(request.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname==='/'){
    event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(request,copy)).catch(()=>{});}return response;}).catch(async()=> (await caches.match(request))||(await caches.match('./index.html'))));
    return;
  }
  event.respondWith((async()=>{
    const cached=await caches.match(request);
    const network=fetch(request).then(response=>{if(response.ok){const clone=response.clone();caches.open(CACHE).then(c=>c.put(request,clone)).catch(()=>{});}return response;}).catch(()=>null);
    if(cached){event.waitUntil(network);return cached;}
    return (await network)||Response.error();
  })());
});
