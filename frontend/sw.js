const CACHE='manavta-shell-v15';
const CORE=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./images/product-hero.webp','./images/pr114.webp','./images/pr126.webp','./images/basmati1121.webp','./images/regional-basmati.webp','./images/bulk-parboiled.webp','./images/custom-milling.webp','./images/manavta-logo.svg','./images/product-placeholder.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE).catch(()=>{})).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const u=new URL(event.request.url);
  if(event.request.method!=='GET'||u.pathname.includes('/api/'))return;
  event.respondWith((async()=>{
    const cached=await caches.match(event.request);
    const network=fetch(event.request).then(response=>{
      if(response.ok&&u.origin===location.origin){const clone=response.clone();caches.open(CACHE).then(c=>c.put(event.request,clone)).catch(()=>{});}
      return response;
    }).catch(()=>null);
    if(cached){event.waitUntil(network);return cached;}
    return (await network)||caches.match('./index.html');
  })());
});
