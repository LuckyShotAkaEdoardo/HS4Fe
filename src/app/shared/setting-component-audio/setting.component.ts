import { Component, OnInit } from '@angular/core';
import { AudioService, SoundEffect } from '../../../service/audio-service';

@Component({
  selector: 'app-settings-audio',
  standalone: true,
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss',
})
export class SettingsAudioComponent implements OnInit {
  volumes = {
    sfx: 0,
    music: 0,
    voice: 0,
  };

  constructor(private audioService: AudioService) {}

  ngOnInit(): void {
    for (const key of Object.keys(this.volumes) as Array<
      keyof typeof this.volumes
    >) {
      this.volumes[key] = this.audioService.getVolume(key);
    }
  }

  setVolume(type: 'sfx' | 'music' | 'voice', event: Event): void {
    const vol = +(event.target as HTMLInputElement).value;
    this.volumes[type] = vol;
    this.audioService.setVolume(type, vol);
  }

  resetVolumes(): void {
    this.audioService.resetVolumes();
    this.ngOnInit(); // ricarica i volumi default
  }

  testAudio(): void {
    this.audioService.playNamed(SoundEffect.CardDraw);
  }
}
