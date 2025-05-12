import { Component } from '@angular/core';
import { DisplaySettingsService } from '../../../service/display-settings.service';

@Component({
  selector: 'app-display-settings',
  templateUrl: './display-settings.component.html',
  styleUrls: ['./display-settings.component.scss'],
})
export class DisplaySettingsComponent {
  constructor(public displayService: DisplaySettingsService) {}

  toggleFullscreen() {
    this.displayService.toggleFullscreen();
  }
}
