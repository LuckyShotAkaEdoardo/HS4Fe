// cutout.service.ts
import { Injectable } from '@angular/core';

export interface Cutout {
  top: number;
  left: number;
  width: number;
  height: number;
}

@Injectable({ providedIn: 'root' })
export class CutoutService {
  private cache = new Map<string, Cutout>();

  async getCutout(frameUrl: string): Promise<Cutout> {
    if (this.cache.has(frameUrl)) {
      return this.cache.get(frameUrl)!;
    }

    const img = await this.loadImage(frameUrl);
    const W = img.width,
      H = img.height;

    // disegno l'immagine su un canvas off‐screen
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, W, H);

    // prendo solo il canale alpha
    const data = ctx.getImageData(0, 0, W, H).data;

    // Flood-fill dal centro per raccogliere la regione trasparente interna
    const thresh = 10; // considera trasparente alpha < 10
    const visited = new Uint8Array(W * H);
    const stack = [{ x: W >> 1, y: H >> 1 }];
    let minX = W,
      minY = H,
      maxX = -1,
      maxY = -1;

    while (stack.length) {
      const { x, y } = stack.pop()!;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      const idxPx = y * W + x;
      if (visited[idxPx]) continue;
      visited[idxPx] = 1;

      const alpha = data[idxPx * 4 + 3];
      if (alpha < thresh) {
        // è parte del “buco”: aggiorno bounding box
        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);
        minY = Math.min(minY, y);
        maxY = Math.max(maxY, y);

        // esploro 4-vicini
        stack.push({ x: x + 1, y });
        stack.push({ x: x - 1, y });
        stack.push({ x, y: y + 1 });
        stack.push({ x, y: y - 1 });
      }
    }

    // se per qualche motivo non ho trovato nulla, caduta di sicurezza su intero
    if (maxX < minX || maxY < minY) {
      minX = 0;
      minY = 0;
      maxX = W;
      maxY = H;
    }

    // converto in percentuali
    const cutout: Cutout = {
      left: (minX / W) * 100,
      top: (minY / H) * 100,
      width: ((maxX - minX + 1) / W) * 100,
      height: ((maxY - minY + 1) / H) * 100,
    };

    this.cache.set(frameUrl, cutout);
    return cutout;
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((res, rej) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => res(img);
      img.onerror = (e) => rej(e);
      img.src = src;
    });
  }
}
