import { Injectable } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class DisplaySettingsService {
  private readonly STORAGE_KEY = 'display_settings';

  private settings: {
    fullscreen: boolean;
    theme: Theme;
  } = {
    fullscreen: false,
    theme: 'dark',
  };

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Valida e assegna solo se corretto
        if (parsed.theme === 'dark' || parsed.theme === 'light') {
          this.settings.theme = parsed.theme;
        }
        this.settings.fullscreen = !!parsed.fullscreen;
      } catch (e) {
        console.warn('Impostazioni corrotte. Uso valori di default.');
      }
    }

    // Applica impostazioni attuali
    this.applyTheme(this.settings.theme);

    if (this.settings.fullscreen) {
      this.requestFullscreen();
    }
  }

  private save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
  }

  // 🟦 Fullscreen
  toggleFullscreen(): void {
    if (!this.settings.fullscreen) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }
    this.settings.fullscreen = !this.settings.fullscreen;
    this.save();
  }

  getFullscreenState(): boolean {
    return this.settings.fullscreen;
  }

  private requestFullscreen() {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if ((docEl as any).webkitRequestFullscreen) {
      (docEl as any).webkitRequestFullscreen();
    } else if ((docEl as any).msRequestFullscreen) {
      (docEl as any).msRequestFullscreen();
    }
  }

  private exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }

  // 🎨 Tema
  setTheme(theme: Theme) {
    this.settings.theme = theme;
    this.applyTheme(theme);
    this.save();
  }

  getTheme(): Theme {
    return this.settings.theme;
  }

  private applyTheme(theme: Theme) {
    document.body.setAttribute('data-theme', theme);
  }
}
