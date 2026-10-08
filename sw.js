// Keeps the app working without internet: the app files are stored on the phone.
const CACHE='rosy-retail-v1-23-0';
const CORE=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(CORE.map(u=>c.add(u).catch(()=>{})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);if(e.request.method!=='GET')return;
  // never cache database traffic
  if(u.hostname.includes('firestore.googleapis.com')||u.hostname.includes('identitytoolkit')||u.hostname.includes('securetoken'))return;
  const isApp=u.origin===location.origin;
  if(isApp&&(e.request.mode==='navigate'||u.pathname.endsWith('.html')||u.pathname.endsWith('/'))){
    // app page: try network first so updates arrive, fall back to the stored copy
    e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));return}
  if(isApp||u.hostname==='www.gstatic.com'||u.hostname.includes('fonts.g')){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const c=res.clone();caches.open(CACHE).then(x=>x.put(e.request,c));return res})))}
});
