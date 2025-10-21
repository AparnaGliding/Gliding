import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';








// const IndigoPreset = definePreset(Aura, {
//   semantic: {
//     primary: {
//       50: '#EEF2FF',   // replace with your indigo-t00 values
//       100: '#E0E7FF',
//       200: '#C7D2FE',
//       300: '#A5B4FC',
//       400: '#818CF8',
//       500: '#6366F1',  // Indigo 500
//       600: '#4F46E5',
//       700: '#4338CA',
//       800: '#3730A3',
//       900: '#312E81',
//       950: '#1E1B4B'
//     }
//   }
// });
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: 'none',
          cssLayer: false
        }
      },
      csp: {
        nonce: undefined
      }
    })
  ]
};
