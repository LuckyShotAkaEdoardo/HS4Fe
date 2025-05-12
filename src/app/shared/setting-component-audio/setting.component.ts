// settings.component.ts
import { Component, OnInit } from '@angular/core';
import { AudioService, SoundEffect } from '../../../service/audio-service';

@Component({
  selector: 'app-settings-audio',
  standalone: true,
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss',
})
export class SettingsAudioComponent implements OnInit {
  sfxVolume;
  musicVolume;
  voiceVolume;
  constructor(private audioService: AudioService) {}
  ngOnInit(): void {
    this.sfxVolume = this.audioService.getVolume('sfx');
    this.musicVolume = this.audioService.getVolume('music');
    this.voiceVolume = this.audioService.getVolume('voice');
  }

  setVolume(type: 'sfx' | 'music' | 'voice', event: Event) {
    const input = event.target as HTMLInputElement;
    const vol = +input.value;
    this.audioService.setVolume(type, vol);
    this[`${type}Volume`] = vol;
  }
  resetVolumes() {
    this.audioService.resetVolumes();
    this.sfxVolume = this.audioService.getVolume('sfx');
    this.musicVolume = this.audioService.getVolume('music');
    this.voiceVolume = this.audioService.getVolume('voice');
  }
  testAudio() {
    this.audioService.playNamed(SoundEffect.CardDraw);
  }
}
