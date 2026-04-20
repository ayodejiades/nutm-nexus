// Empty service worker to prevent 404 errors
// This file exists only to silence the sw.js 404 in dev logs
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
