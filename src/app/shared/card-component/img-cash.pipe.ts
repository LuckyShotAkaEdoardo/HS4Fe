import { Pipe, PipeTransform } from '@angular/core';
import { CardImageCacheService } from './card.service';

@Pipe({ name: 'cardImageCache', pure: false })
export class CardImageCachePipe implements PipeTransform {
  private cachedUrls = new Map<string, string>();

  constructor(private cacheService: CardImageCacheService) {}

  transform(imageUrl: string): string | null {
    if (!imageUrl) return null;

    const alreadyCached = this.cachedUrls.get(imageUrl);
    if (alreadyCached) return alreadyCached;

    // Attiva cache async senza bloccare Angular
    this.cacheService.getCachedImageUrl(imageUrl).then((blobUrl) => {
      this.cachedUrls.set(imageUrl, blobUrl);
    });

    return null; // Angular ri-renderizza quando la pipe cambia
  }
}
