const CACHE='invoice-record-v3';
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil((async()=>{
 const keys=await caches.keys();
 await Promise.all(keys.filter(k=>k.startsWith('invoice-record-')&&k!==CACHE).map(k=>caches.delete(k)));
 await self.clients.claim();
})()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET') return;
 const url=new URL(e.request.url);
 if(url.origin===location.origin && (url.pathname.endsWith('/index.html')||url.pathname.endsWith('/sw.js')||url.pathname.endsWith('/manifest.webmanifest'))){
  e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{
   if(r.ok && url.pathname.endsWith('/index.html')) caches.open(CACHE).then(c=>c.put('./index.html',r.clone()));
   return r;
  }).catch(()=>caches.match('./index.html')));
  return;
 }
 e.respondWith(caches.open(CACHE).then(c=>c.match(e.request)).then(cached=>cached||fetch(e.request).then(r=>{
  if(r.ok) caches.open(CACHE).then(c=>c.put(e.request,r.clone()));
  return r;
 }).catch(()=>caches.match('./index.html'))));
});