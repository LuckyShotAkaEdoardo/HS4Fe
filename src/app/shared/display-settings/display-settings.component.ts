import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../../material.module';
import { DisplaySettingsService } from '../../../service/display-settings.service';
export const Themes = [
  { code: 'napoli', name: 'Azzurro Napoli', color: '#007bff' },
  { code: 'nwb', name: 'Nero su Bianco', color: '#ffffff' },
  { code: 'bwn', name: 'Bianco su Nero', color: '#000000' },
  { code: 'fire', name: 'Fuoco', color: '#ff5722' },
  { code: 'ice', name: 'Ghiaccio', color: '#00acc1' },
  { code: 'light', name: 'Luce', color: '#ffeb3b' },
  { code: 'dark', name: 'Oscurità', color: '#7e57c2' },
  { code: 'magic', name: 'Magia', color: '#9c27b0' },
  { code: 'rock', name: 'Roccia', color: '#8d6e63' },
  { code: 'forest', name: 'Foresta', color: '#4caf50' },
  { code: 'plain', name: 'Pianura', color: '#a2c523' },
];

@Component({
  selector: 'app-display-settings',
  standalone: true,

  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule],
  template: `
    <div class="display-settings">
      <!-- <mat-checkbox
        appDoubleTap
        [checked]="settings().fullscreen"
        (click)="service.toggleFullscreen()"
      >
        
      </mat-checkbox> -->
      <div class="checkbox-container">
        <label class="magic-checkbox">
          <input
            appDoubleTap
            [checked]="settings().fullscreen"
            (click)="service.toggleFullscreen()"
            type="checkbox"
          />
          <span class="checkmark"></span>
          🔳 Schermo Intero
        </label>
      </div>
      <div class="slider-group">
        <label>🧍 Avversario (% Altezza)</label>

        <input
          type="range"
          min="0"
          max="50"
          step="1"
          [value]="settings().sizes.enemy"
          (input)="
            service.updateSizes({
              enemy: parseInt($any($event.target).value)
            })
          "
        />
      </div>

      <div class="slider-group">
        <label>🧩 Plancia Centrale (% Altezza)</label>
        <input
          type="range"
          min="10"
          max="50"
          step="1"
          [value]="settings().sizes.board"
          (input)="
            service.updateSizes({
              board: parseInt($any($event.target).value)
            })
          "
        />
      </div>

      <div class="slider-group">
        <label>🙋‍♂️ Giocatore (% Altezza)</label>
        <input
          type="range"
          min="10"
          max="50"
          step="1"
          [value]="settings().sizes.player"
          (input)="
            service.updateSizes({
              player: parseInt($any($event.target).value)
            })
          "
        />
      </div>

      <div class="theme-selector">
        <button
          *ngFor="let theme of themes"
          class="theme-button"
          [ngStyle]="{ 'background-color': theme.color }"
          (click)="setTheme(theme.code)"
          [title]="theme.name"
        ></button>
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

      /* Etichette dei controlli */
      label {
        color: var(--accent-color); /* era #00b4d8 */
        font-weight: 600;
      }

      /* Slider Material */
      mat-slider {
        width: 100%;
      }

      /* Checkbox Material */
      mat-checkbox {
        color: var(--accent-color); /* era #00b4d8 */
      }

      /* Contenitore dei bottoni tema */
      .theme-selector {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        padding: 16px;
        justify-content: center;
      }

      /* Bottone tema circolare */
      .theme-button {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid var(--button-text); /* era bianco */
        cursor: pointer;
        transition: transform 0.2s, box-shadow 0.2s;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
      }

      .theme-button:hover {
        transform: scale(1.1);
        box-shadow: 0 0 8px rgba(0, 0, 0, 0.5);
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
  themes: any = [];
  ngOnInit(): void {
    this.themes = Themes;
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

  setTheme(themeCode: any): void {
    this.service.setTheme(themeCode);
  }
}
