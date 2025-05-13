import { Component, inject } from '@angular/core';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { CommandConfigService } from '../../service/command-config.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-keybinding-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  template: `
    <div class="keybinding-panel">
      <h2>⌨️ Assegna Tasti a Comandi</h2>
      <div *ngFor="let context of contexts" class="context-section">
        <h3>{{ context }}</h3>
        <div
          *ngFor="let key of getKeys(context); let i = index"
          class="key-row"
        >
          <mat-form-field appearance="fill">
            <mat-label>Tasto</mat-label>
            <input
              matInput
              [(ngModel)]="keyBindings[context][keyName(key)]"
              placeholder="es. Q"
            />
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Azione</mat-label>
            <mat-select [(value)]="keyBindings[context][key]">
              <mat-option
                *ngFor="let action of availableCommands"
                [value]="action"
              >
                {{ action }}
              </mat-option>
            </mat-select>
          </mat-form-field>

          <button
            mat-button
            color="warn"
            appDoubleTap
            (click)="removeKey(context, key)"
          >
            🗑️
          </button>
        </div>

        <div class="add-key">
          <button mat-raised-button appDoubleTap (click)="addKey(context)">
            ➕ Aggiungi Tasto
          </button>
        </div>
      </div>

      <button mat-raised-button color="primary" appDoubleTap (click)="save()">
        💾 Salva
      </button>
    </div>
  `,
  styles: [
    `
      .keybinding-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 500px;
        padding: 1rem;
      }
      .context-section {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 1rem;
      }
      .key-row {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }
      .add-key {
        margin-top: 1rem;
      }
    `,
  ],
})
export class KeybindingSettingsComponent {
  private commandService = inject(CommandConfigService);
  contexts = this.commandService.getContexts();
  availableCommands = this.commandService.getAvailableCommands();
  keyBindings: Record<string, Record<string, string>> = {};

  ngOnInit() {
    for (const ctx of this.contexts) {
      this.keyBindings[ctx] = { ...this.commandService.getKeyBindings(ctx) };
    }
  }

  getKeys(context: string): string[] {
    return Object.keys(this.keyBindings[context] ?? {});
  }

  keyName(original: string): string {
    return original;
  }

  addKey(context: string) {
    this.keyBindings[context][''] = 'none';
  }

  removeKey(context: string, key: string) {
    delete this.keyBindings[context][key];
  }

  save() {
    for (const ctx of this.contexts) {
      for (const key in this.keyBindings[ctx]) {
        this.commandService.setCommand(
          ctx,
          'key',
          this.keyBindings[ctx][key],
          key
        );
      }
    }
  }
}
