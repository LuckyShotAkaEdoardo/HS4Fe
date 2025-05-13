import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { DisplaySettingsService } from '../../../service/display-settings.service';

@Component({
  selector: 'app-display-settings',
  standalone: true,

  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  template: `
    <div class="display-settings">
      <mat-checkbox
        appDoubleTap
        [checked]="settings().fullscreen"
        (click)="service.toggleFullscreen()"
      >
        🔳 Schermo Intero
      </mat-checkbox>

      <div class="slider-group">
        <label>🧍 Avversario (% Altezza)</label>
        <mat-slider min="10" max="50" step="1">
          <input
            matSliderThumb
            [value]="settings().sizes.enemy"
            (input)="
              service.updateSizes({
                enemy: parseInt($any($event.target).value)
              })
            "
          />
        </mat-slider>
      </div>

      <div class="slider-group">
        <label>🧩 Plancia Centrale (% Altezza)</label>
        <mat-slider min="10" max="80" step="1">
          <input
            matSliderThumb
            [value]="settings().sizes.board"
            (input)="
              service.updateSizes({
                board: parseInt($any($event.target).value)
              })
            "
          />
        </mat-slider>
      </div>

      <div class="slider-group">
        <label>🙋‍♂️ Giocatore (% Altezza)</label>
        <mat-slider min="10" max="50" step="1">
          <input
            matSliderThumb
            [value]="settings().sizes.player"
            (input)="
              service.updateSizes({
                player: parseInt($any($event.target).value)
              })
            "
          />
        </mat-slider>
      </div>
    </div>
  `,
  styles: [
    `
      .display-settings {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        padding: 1rem;
      }

      .slider-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      label {
        color: #00b4d8;
        font-weight: 600;
      }

      mat-slider {
        width: 100%;
      }

      mat-checkbox {
        color: #00b4d8;
      }
    `,
  ],
})
export class DisplaySettingsPanelComponent {
  service = inject(DisplaySettingsService);
  settings = this.service.settings;

  enemyControl = new FormControl(0);
  boardControl = new FormControl(0);
  playerControl = new FormControl(0);
  ngOnInit(): void {
    const s = this.settings();
    this.enemyControl.setValue(s.sizes.enemy);
    this.boardControl.setValue(s.sizes.board);
    this.playerControl.setValue(s.sizes.player);

    this.enemyControl.valueChanges.subscribe((val) => {
      this.service.updateSizes({ enemy: val ?? 0 });
    });
    this.boardControl.valueChanges.subscribe((val) => {
      this.service.updateSizes({ board: val ?? 0 });
    });
    this.playerControl.valueChanges.subscribe((val) => {
      this.service.updateSizes({ player: val ?? 0 });
    });
  }
  parseInt(val: string): number {
    return parseInt(val, 10);
  }
}
