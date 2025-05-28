import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { SocketService } from '../service/socket.service';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { CardService } from '../service/card.service';
import { CutoutService } from '../service/service-card';
import { AudioService } from '../service/audio-service';
import { DisplaySettingsService } from '../service/display-settings.service';
import { DoubleTapDirective } from '../directive/long-press.directive';
import { DeckService } from '../service/deck-service';
import { HttpErrorInterceptor } from '../guard/interceptor-error';
import { CardEffectClassPipe } from '../directive/card-effect.pipe';
import { CardEffectHighlightDirective } from '../directive/card-effect.directive';
import { CardImageCacheService } from './shared/card-component/card.service';
import { CardImageCachePipe } from './shared/card-component/img-cash.pipe';
import { AnimationOverlayService } from '../service/animation-service';
import { provideAnimations } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    provideHttpClient(withInterceptorsFromDi()),
    SocketService,
    CardService,
    CutoutService,
    AudioService,
    DisplaySettingsService,
    DoubleTapDirective,
    DisplaySettingsService,
    DeckService,
    CardEffectClassPipe,
    CardEffectHighlightDirective,
    CardImageCacheService,
    CardImageCachePipe,
    AnimationOverlayService,
    provideAnimations(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
  ],
};
