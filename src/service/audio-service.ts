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
  private audioMap: Record<string, { url: string; category: AudioCategory }> = {
    'card-draw': { url: 'assets/audio/card-draw-flick.mp3', category: 'sfx' },
    'turn-end': { url: 'assets/audio/turn-end.mp3', category: 'sfx' },
    victory: { url: 'assets/audio/victory.mp3', category: 'music' },
    // puoi aggiungere altri...
  };
  private volumes: Record<AudioCategory, number> = {
    sfx: parseFloat(localStorage.getItem('volume_sfx') ?? '0.8'),
    music: parseFloat(localStorage.getItem('volume_music') ?? '0.6'),
    voice: parseFloat(localStorage.getItem('volume_voice') ?? '1.0'),
  };

  setVolume(category: AudioCategory, value: number) {
    this.volumes[category] = value;
    localStorage.setItem(`volume_${category}`, value.toString());
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
    console.log('sei qui');
    if (!entry) {
      console.warn(`Audio '${effect}' non trovato.`);
      return;
    }
    console.log('sei qui');
    this.play(entry.url, entry.category);
  }
  resetVolumes() {}
}
