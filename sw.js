const CACHE_NAME = "food-handbook-cache-v1";
const urlsToCache = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png"
];

// 安装 SW：缓存文件
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// 激活 SW
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// 拦截请求：优先缓存
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
