// floating-settings.component.ts
import { NgIf } from '@angular/common';
import { Component, ElementRef, HostListener, inject } from '@angular/core';
import { SettingsAudioComponent } from '../setting-component-audio/setting.component';
import { DisplaySettingsPanelComponent } from '../display-settings/display-settings.component';
import { AudioService } from '../../../service/audio-service';
import { KeybindingSettingsComponent } from '../display-setting-control/display-setting-control.component';
import { DisplaySettingsService } from '../../../service/display-settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings-component.component.html',
  styleUrl: './settings-component.component.scss',
  standalone: true,
  imports: [
    NgIf,
    SettingsAudioComponent,
    DisplaySettingsPanelComponent,
    KeybindingSettingsComponent,
  ],
})
export class SettingsComponent {
  isOpen = false;
  panelWidth = 320;
  panelHeight = 300;
  resizingH = false;
  resizingV = false;
  startX = 0;
  startY = 0;
  startWidth = 320;
  startHeight = 300;
  activeSection = 'style';
  audioService = inject(AudioService);
  displaySettingsService = inject(DisplaySettingsService);
  togglePanel() {
    this.isOpen = !this.isOpen;
  }

  setSection(section: string) {
    this.activeSection = section;
  }

  startResizeH(event: MouseEvent) {
    this.resizingH = true;
    this.startX = event.clientX;
    this.startWidth = this.panelWidth;
    event.preventDefault();
  }

  startResizeV(event: MouseEvent) {
    this.resizingV = true;
    this.startY = event.clientY;
    this.startHeight = this.panelHeight;
    event.preventDefault();
  }
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (this.resizingH) {
      const deltaX = this.startX - event.clientX;
      const newWidth = this.startWidth + deltaX;
      if (newWidth > 200 && newWidth < windowWidth - 50) {
        this.panelWidth = newWidth;
      }
    }

    if (this.resizingV) {
      const deltaY = this.startY - event.clientY;
      const newHeight = this.startHeight + deltaY;
      if (newHeight > 200 && newHeight < windowHeight - 50) {
        this.panelHeight = newHeight;
      }
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.resizingH = false;
    this.resizingV = false;
  }
  save() {
    const fullAppSettings = {
      audioSettings: this.audioService.exportSettings().audioSettings,
      videoSettings:
        this.displaySettingsService.exportSettings().displaySettings,
    };
    console.log(fullAppSettings);
  }
}
