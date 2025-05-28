import { Injectable, signal } from '@angular/core';
import { ThemeName, Themes } from './model';

export interface DisplaySizes {
  enemy: number;
  board: number;
  player: number;
}

export interface DisplaySettings {
  sizes: DisplaySizes;
  fullscreen: boolean;
}

@Injectable({ providedIn: 'root' })
export class DisplaySettingsService {
  private _settings = signal<DisplaySettings>({
    sizes: { enemy: 15, board: 60, player: 20 },
    fullscreen: false,
  });

  settings = this._settings.asReadonly();
  constructor() {
    this.setTheme('napoli');
  }
  getSettings(): DisplaySettings {
    return this._settings();
  }

  setSettings(settings: Partial<DisplaySettings>): void {
    this._settings.update((prev) => ({
      ...prev,
      ...settings,
      sizes: settings.sizes ? { ...prev.sizes, ...settings.sizes } : prev.sizes,
    }));
  }

  updateSizes(sizes: Partial<DisplaySizes>): void {
    this._settings.update((prev) => ({
      ...prev,
      sizes: { ...prev.sizes, ...sizes },
    }));
  }

  toggleFullscreen(): void {
    const isFullscreen = this._settings().fullscreen;

    if (!isFullscreen) {
      this.requestFullscreen();
    } else {
      this.exitFullscreen();
    }

    this.setFullscreen(!isFullscreen);
  }

  private requestFullscreen(): void {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) {
      docEl.requestFullscreen();
    } else if ((docEl as any).webkitRequestFullscreen) {
      (docEl as any).webkitRequestFullscreen();
    } else if ((docEl as any).msRequestFullscreen) {
      (docEl as any).msRequestFullscreen();
    }
  }

  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen();
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen();
    }
  }

  setFullscreen(value: boolean): void {
    this._settings.update((prev) => ({ ...prev, fullscreen: value }));
  }

  exportSettings(): { displaySettings: DisplaySettings } {
    return { displaySettings: this._settings() };
  }

  importSettings(data: { displaySettings: DisplaySettings }): boolean {
    if (!data?.displaySettings) return false;
    this._settings.set(data.displaySettings);
    return true;
  }

  private readonly themes = Themes;
  private currentTheme: ThemeName = 'napoli';

  setTheme(theme: ThemeName): void {
    const root = document.documentElement;
    const vars = this.themes[theme];
    if (!vars) return;

    // Rimuovi tutte le variabili conosciute
    const allKeys = Object.values(this.themes).flatMap((obj) =>
      Object.keys(obj)
    );
    [...new Set(allKeys)].forEach((key) => root.style.removeProperty(key));

    // Applica le nuove
    Object.entries(vars).forEach(([key, value]) =>
      root.style.setProperty(key, value)
    );

    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
  }

  getCurrentTheme(): ThemeName {
    return this.currentTheme;
  }
}
