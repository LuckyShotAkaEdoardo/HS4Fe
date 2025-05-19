import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CardImageCacheService {
  private readonly CACHE_NAME = 'card-image-cache';

  async getCachedImageUrl(url: string): Promise<string> {
    const cache = await caches.open(this.CACHE_NAME);
    const match = await cache.match(url);
    console.log(cache, 'match', match);
    if (match) return URL.createObjectURL(await match.blob());

    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Immagine non trovata');

    cache.put(url, response.clone());
    return URL.createObjectURL(await response.blob());
  }

  async clearCache(): Promise<void> {
    await caches.delete(this.CACHE_NAME);
  }
}
