import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { SocketService } from '../service/socket.service';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { CardService } from '../service/card.service';
import { CutoutService } from './deck-builder/card-component/service-card';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    SocketService,
    provideHttpClient(withInterceptorsFromDi()),
    CardService,
    CutoutService,
  ],
};
