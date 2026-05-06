const CACHE = 'wink-v13';
const ASSETS = ['/Brand Assets/Logo.png'];

self.addEventListener('install', function(e) {
  e.waitUntil(caches.open(CACHE).then(function(c) { return c.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Fonts: network with cache fallback
  if(url.indexOf('fonts.googleapis.com')>=0||url.indexOf('fonts.gstatic.com')>=0){
    e.respondWith(fetch(e.request).catch(function(){return caches.match(e.request);}));
    return;
  }

  // HTML navigation: network-first so updates are always instant
  if(e.request.mode==='navigate'||url.endsWith('.html')||url.endsWith('/')){
    e.respondWith(
      fetch(e.request).then(function(res){
        if(res.ok){var clone=res.clone();caches.open(CACHE).then(function(c){c.put(e.request,clone);});}
        return res;
      }).catch(function(){return caches.match(e.request);})
    );
    return;
  }

  // Everything else (images, etc.): cache-first
  e.respondWith(caches.match(e.request).then(function(r){
    return r||fetch(e.request).then(function(res){
      if(res.ok&&e.request.method==='GET'){var clone=res.clone();caches.open(CACHE).then(function(c){c.put(e.request,clone);});}
      return res;
    });
  }));
});
