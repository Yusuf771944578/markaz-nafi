const CACHE='nafi-center-v4';
const RUNTIME='nafi-runtime-v4';
const ASSETS=['./','./index.html','./logo.png','./mahktot.png','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==RUNTIME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  if(url.origin===self.location.origin){
    e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(c=>{try{c.put(e.request,copy);}catch(_){}});
      return res;
    }).catch(()=>caches.match('./index.html'))));
  }else{
    e.respondWith(caches.open(RUNTIME).then(c=>c.match(e.request).then(hit=>{
      const net=fetch(e.request).then(res=>{ if(res&&(res.status===200||res.type==='opaque')){ try{c.put(e.request,res.clone());}catch(_){} } return res; }).catch(()=>hit);
      return hit||net;
    })));
  }
});
