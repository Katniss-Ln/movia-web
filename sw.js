const CACHE="movia-web-pwa-v3";
const ROOT=new URL("./",self.location.href);
const SHELL=["index.html","styles.css","app.js","manifest.webmanifest","assets/icon.svg","assets/movia-icon.png"].map(p=>new URL(p,ROOT).href);
self.addEventListener("install",event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await cache.addAll(SHELL);await self.skipWaiting()})()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener("fetch",event=>{const request=event.request;if(request.method!=="GET"||new URL(request.url).origin!==location.origin)return;event.respondWith((async()=>{const cache=await caches.open(CACHE);const cached=await cache.match(request);if(cached)return cached;try{const response=await fetch(request);if(response.ok)cache.put(request,response.clone());return response}catch{return Response.error()}})())});
