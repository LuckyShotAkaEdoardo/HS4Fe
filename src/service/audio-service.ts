import { Injectable } from '@angular/core';

type AudioCategory = 'sfx' | 'music' | 'voice';

export enum SoundEffect {
  CardDraw = 'card-draw',
  TurnEnd = 'turn-end',
  Victory = 'victory',
  // altri effetti...
}

interface Soundtrack {
  name: string;
  url: string;
}

interface AudioSettings {
  volumes: Record<AudioCategory, number>;
  userSoundtracks: Soundtrack[];
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly STORAGE_KEY = 'audioSettings';

  private defaultSettings: AudioSettings = {
    volumes: {
      sfx: 0.8,
      music: 0.6,
      voice: 1.0,
    },
    userSoundtracks: [],
  };

  private settings: AudioSettings;

  private currentMusic: HTMLAudioElement | null = null;

  private audioMap: Record<string, { url: string; category: AudioCategory }> = {
    'card-draw': { url: 'assets/audio/card-draw-flick.mp3', category: 'sfx' },
    'turn-end': { url: 'assets/audio/turn-end.mp3', category: 'sfx' },
    victory: { url: 'assets/audio/victory.mp3', category: 'music' },
  };

  private baseSoundtracks: Soundtrack[] = [
    { name: 'Fantasy Theme', url: 'assets/audio/music-fantasy.mp3' },
    { name: 'Battle Drums', url: 'assets/audio/music-battle.mp3' },
    { name: 'Tavern Loop', url: 'assets/audio/music-tavern.mp3' },
  ];

  constructor() {
    const raw = localStorage.getItem(this.STORAGE_KEY);
    try {
      this.settings = raw
        ? JSON.parse(raw)
        : structuredClone(this.defaultSettings);
    } catch {
      this.settings = structuredClone(this.defaultSettings);
      this.saveSettings();
    }
  }

  // 🔁 Salvataggio centralizzato
  private saveSettings() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
  }

  // 🔊 Volume
  getVolume(category: AudioCategory): number {
    return this.settings.volumes[category];
  }

  setVolume(category: AudioCategory, value: number) {
    this.settings.volumes[category] = value;
    this.saveSettings();
  }

  resetVolumes() {
    this.settings.volumes = structuredClone(this.defaultSettings.volumes);
    this.saveSettings();
  }

  // 🔈 Play effetti o musiche
  play(url: string, category: AudioCategory = 'sfx') {
    const audio = new Audio(url);
    audio.volume = this.getVolume(category);
    if (category === 'music') {
      audio.loop = true;
      this.stopMusic(); // stop precedente
      this.currentMusic = audio;
    }
    audio.play();
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.pause();
      this.currentMusic = null;
    }
  }

  playNamed(effect: SoundEffect) {
    const entry = this.audioMap[effect];
    if (!entry) {
      console.warn(`Audio '${effect}' non trovato.`);
      return;
    }
    this.play(entry.url, entry.category);
  }

  // 🎵 Soundtrack utente
  getAllSoundtracks(): Soundtrack[] {
    return [...this.baseSoundtracks, ...this.settings.userSoundtracks];
  }

  addUserSoundtrack(track: Soundtrack) {
    this.settings.userSoundtracks.push(track);
    this.saveSettings();
  }

  removeUserSoundtrack(name: string) {
    this.settings.userSoundtracks = this.settings.userSoundtracks.filter(
      (t) => t.name !== name
    );
    this.saveSettings();
  }
  importSettings(from: any): boolean {
    try {
      const parsed = from?.audioSettings as AudioSettings;

      // Validazione base
      if (
        !parsed ||
        !parsed.volumes ||
        !parsed.userSoundtracks ||
        typeof parsed.volumes.sfx !== 'number' ||
        typeof parsed.volumes.music !== 'number' ||
        typeof parsed.volumes.voice !== 'number' ||
        !Array.isArray(parsed.userSoundtracks)
      ) {
        throw new Error('Formato audioSettings non valido');
      }

      this.settings = parsed;
      this.saveSettings();
      return true;
    } catch (e) {
      console.error("Errore durante l'import delle impostazioni audio:", e);
      return false;
    }
  }
  exportSettings(): { audioSettings: AudioSettings } {
    return { audioSettings: this.settings };
  }
}
