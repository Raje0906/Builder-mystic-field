// Unregister all service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    console.log('Unregistering service workers...');
    for (const registration of registrations) {
      registration.unregister().then(function(unregistered) {
        console.log('ServiceWorker unregistered', unregistered);
      });
    }
    // Clear all caches
    caches.keys().then(function(cacheNames) {
      console.log('Clearing caches...');
      return Promise.all(
        cacheNames.map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      console.log('All caches cleared');
      // Force reload to ensure fresh content
      window.location.reload(true);
    });
  });
}
