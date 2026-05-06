const CACHE = 'wink-v7';
const CORE = ['/', '/index.html', '/Brand Assets/Logo.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(CORE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  // Cache-first for local assets, network-first for Google Fonts
  if(e.request.url.indexOf('fonts.googleapis.com')>=0||e.request.url.indexOf('fonts.gstatic.com')>=0){
    e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request);}));
    return;
  }
  e.respondWith(caches.match(e.request).then(function(r){return r||fetch(e.request).then(function(res){
    if(res.ok&&e.request.method==='GET'){
      var clone=res.clone();
      caches.open(CACHE).then(function(c){c.put(e.request,clone);});
    }
    return res;
  });}));
});
