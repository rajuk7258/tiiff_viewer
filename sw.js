self.addEventListener('install', evt => { evt.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', evt => { evt.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', evt => {
  // Basic network-first strategy can be added here.
});