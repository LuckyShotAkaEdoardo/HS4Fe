import { Injectable } from '@angular/core';

type AudioCategory = 'sfx' | 'music' | 'voice';
export enum SoundEffect {
  CardDraw = 'card-draw',
  TurnEnd = 'turn-end',
  Victory = 'victory',
  // aggiungi altri qui...
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly STORAGE_KEY = 'audioSettings';

  private defaultVolumes: Record<AudioCategory, number> = {
    sfx: 0.8,
    music: 0.6,
    voice: 1.0,
  };

  private volumes: Record<AudioCategory, number>;

  constructor() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    try {
      this.volumes = saved ? JSON.parse(saved) : { ...this.defaultVolumes };
    } catch (e) {
      console.warn('Impostazioni audio corrotte, ripristino default.');
      this.volumes = { ...this.defaultVolumes };
      this.saveSettings(); // salva subito i default validi
    }
  }

  private saveSettings() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.volumes));
  }

  setVolume(category: AudioCategory, value: number) {
    this.volumes[category] = value;
    this.saveSettings();
  }

  getVolume(category: AudioCategory): number {
    return this.volumes[category];
  }

  play(url: string, category: AudioCategory = 'sfx') {
    const audio = new Audio(url);
    audio.volume = this.getVolume(category);
    audio.play();
  }

  playNamed(effect: SoundEffect) {
    const entry = this.audioMap[effect];
    if (!entry) {
      console.warn(`Audio '${effect}' non trovato.`);
      return;
    }
    this.play(entry.url, entry.category);
  }

  resetVolumes() {
    this.volumes = { ...this.defaultVolumes };
    this.saveSettings();
  }

  private audioMap: Record<string, { url: string; category: AudioCategory }> = {
    'card-draw': { url: 'assets/audio/card-draw-flick.mp3', category: 'sfx' },
    'turn-end': { url: 'assets/audio/turn-end.mp3', category: 'sfx' },
    victory: { url: 'assets/audio/victory.mp3', category: 'music' },
  };
}
