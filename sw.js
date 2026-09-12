/* HMD — نظام إدارة الكراج : يخلي الموقع يفتح بدون إنترنت */
const CACHE = "hmd-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()).catch(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;            // دروب بوكس وغيره: يمر عادي
  e.respondWith(
    fetch(req).then((res) => {                            // أونلاين: آخر نسخة دايماً
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() =>                                        // أوفلاين: من الكاش
      caches.match(req).then((hit) => hit || caches.match("./index.html"))
    )
  );
});
