import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './app/environments/environment.prod';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, appConfig).then(() => {
  if ('serviceWorker' in navigator && environment.production) {
    navigator.serviceWorker.ready.then(registration => {
      registration.update();
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            if (confirm('Nueva versión disponible. ¿Actualizar?')) {
              window.location.reload();
            }
          }
        });
      });
    });
  }
});