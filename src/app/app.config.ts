import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '../environments/environment';
import { mockBackendProviders } from '../environments/mock-backend.providers';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withInMemoryScrolling({
      // Every page starts at the header, including back/forward navigation.
      scrollPositionRestoration: 'top',
    })),
    provideHttpClient(withInterceptorsFromDi()),
    ...(environment.production ? [provideClientHydration(withEventReplay())] : []),
    ...mockBackendProviders
  ]
};
