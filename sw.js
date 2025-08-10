// Phase 1.1 Service Worker: cache bust + instant update
const CACHE_NAME = "dsg-cache-phase1.1-rebuild";
const ASSETS = ["./","./index.html","./manifest.json","./icon.svg"];

self.addEventListener("install", (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)));
});

self.addEventListener("activate", (e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && caches.delete(k)))),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e)=>{
  e.respondWith(
    caches.match(e.request).then(res=> res || fetch(e.request).then(resp=>{
      if(e.request.method==="GET"){
        const clone = resp.clone();
        caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
      }
      return resp;
    }).catch(()=>caches.match("./index.html")))
  );
});
