import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // View Transitions API for the config <-> play screen navigation (FR-012a). The Router
    // feature-detects support itself and just navigates normally where it's unavailable — no
    // extra fallback code needed here (research.md §7).
    provideRouter(routes, withViewTransitions()),
  ],
};
