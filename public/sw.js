const CACHE_NAME = 'summer-chill-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/src/styles/index.css',
  '/src/styles/components.css',
  '/src/styles/animations.css',
  '/src/styles/landing.css',
  '/src/styles/dashboard.css',
  '/src/main.js',
  '/src/firebase/config.js',
  '/src/firebase/auth.js',
  '/src/firebase/database.js',
  '/src/components/navbar.js',
  '/src/components/members.js',
  '/src/components/modal.js',
  '/src/components/toast.js',
  '/src/components/onboarding.js',
  '/src/components/hero.js',
  '/src/components/resort-info.js',
  '/src/components/map-section.js',
  '/src/components/activities.js',
  '/src/components/schedule.js',
  '/src/components/checklist.js',
  '/src/components/voting.js',
  '/src/components/expenses.js',
  '/src/pages/landing.js',
  '/src/pages/dashboard.js',
  '/src/utils/constants.js',
  '/src/utils/countdown.js',
  // Cache Alpine.js CDN
  'https://cdn.jsdelivr.net/npm/alpinejs@3.13.8/dist/cdn.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Bỏ qua các request tới Firebase Database
  if (event.request.url.includes('firebaseio.com') || event.request.url.includes('firebasedatabase.app') || event.request.url.includes('googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    }).catch(() => {
      // Fallback for offline mode if not found in cache
      if (event.request.mode === 'navigate') {
        return caches.match('/');
      }
    })
  );
});
