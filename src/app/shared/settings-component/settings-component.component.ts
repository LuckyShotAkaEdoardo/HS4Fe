// floating-settings.component.ts
import { NgIf } from '@angular/common';
import { Component, ElementRef, HostListener } from '@angular/core';
import { SettingsAudioComponent } from '../setting-component-audio/setting.component';

@Component({
  selector: 'app-settings',
  templateUrl: './settings-component.component.html',
  styleUrl: './settings-component.component.scss',
  standalone: true,
  imports: [NgIf, SettingsAudioComponent],
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
  activeSection = 'audio';

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
    if (this.resizingH) {
      const deltaX = this.startX - event.clientX;
      this.panelWidth = Math.min(600, Math.max(200, this.startWidth + deltaX));
    }
    if (this.resizingV) {
      const deltaY = this.startY - event.clientY;
      this.panelHeight = Math.min(
        600,
        Math.max(200, this.startHeight + deltaY)
      );
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.resizingH = false;
    this.resizingV = false;
  }
}
