const C='ge-remake-v60';
const PRE=['./','index.html','assets/loading.webp','assets/loading_l.webp','assets/audio/music.mp3','manifest.webmanifest','favicon.ico','assets/icons/apple-touch-icon.png','assets/icons/apple-touch-icon-167.png','assets/icons/apple-touch-icon-152.png','assets/icons/apple-touch-icon-120.png','assets/icons/icon-192.png','assets/icons/icon-512.png','assets/icons/maskable-192.png','assets/icons/maskable-512.png','assets/icons/favicon-32.png','assets/icons/favicon-16.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>Promise.all(PRE.map(u=>c.add(u).catch(()=>{})))))});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
// Audio mit Range-Anfrage (iOS) aus dem Cache als 206 beantworten
async function ranged(req){const c=await caches.open(C);const url=new URL(req.url);url.search='';let r=await c.match(url.href);if(!r){r=await fetch(url.href);if(r.status===200)c.put(url.href,r.clone())}
 if(r.status!==200)return r;const buf=await r.arrayBuffer();const m=/bytes=(\d*)-(\d*)/.exec(req.headers.get('range')||'');const n=buf.byteLength;let s=m&&m[1]?+m[1]:0,e=m&&m[2]?+m[2]:n-1;e=Math.min(e,n-1);
 return new Response(buf.slice(s,e+1),{status:206,headers:{'Content-Type':'audio/mpeg','Content-Range':`bytes ${s}-${e}/${n}`,'Content-Length':String(e-s+1),'Accept-Ranges':'bytes'}})}
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;
 // v42: HTML/Navigation immer zuerst aus dem Netz (sonst startet nach einem Update noch einmal die alte Version)
 if(e.request.mode==='navigate'||/\/(index\.html)?(\?.*)?$/.test(new URL(e.request.url).pathname+new URL(e.request.url).search)){e.respondWith(fetch(e.request).then(r=>{if(r.status===200){const c2=r.clone();caches.open(C).then(c=>c.put('index.html',c2)).catch(()=>{})}return r}).catch(()=>caches.match('index.html').then(r=>r||caches.match('./'))));return}
 if(e.request.url.includes('/audio/')&&e.request.headers.get('range')){e.respondWith(ranged(e.request).catch(()=>fetch(e.request)));return}
 e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(e.request);const net=fetch(e.request).then(r=>{if(r.status===200)c.put(e.request,r.clone()).catch(()=>{});return r}).catch(()=>hit);return hit||net}))});
