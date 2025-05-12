import { Injectable } from '@angular/core';

export type CommandType = 'click' | 'longPress' | 'key';

export interface CommandMapEntry {
  click: string;
  longPress: string;
  key: Record<string, string>;
}

export interface CommandMap {
  [context: string]: CommandMapEntry;
}

export interface CommandSettings {
  commandSettings: CommandMap;
}

@Injectable({ providedIn: 'root' })
export class CommandConfigService {
  private config: CommandMap = {
    'deck-builder': { click: 'addToDeck', longPress: 'zoom', key: {} },
    'game-board': { click: 'selectCard', longPress: 'zoom', key: {} },
  };

  constructor() {
    this.loadFromLocalStorage();
  }
  getCommand(context: string, type: CommandType, key?: string): string {
    const entry = this.config[context];
    if (!entry) return 'none';

    if (type === 'key') {
      return key ? entry.key?.[key] ?? 'none' : 'none';
    }

    if (type in entry && typeof entry[type] === 'string') {
      return entry[type as keyof CommandMapEntry] as string;
    }

    return 'none';
  }
  setCommand(
    context: string,
    type: CommandType,
    command: string,
    key?: string
  ): void {
    if (!this.config[context]) {
      this.config[context] = { click: 'none', longPress: 'none', key: {} };
    }

    const entry = this.config[context];

    if (type === 'key') {
      if (key) {
        entry.key[key] = command;
      }
    } else if (type in entry && typeof entry[type] === 'string') {
      (entry[type as keyof Omit<CommandMapEntry, 'key'>] as string) = command;
    }

    this.saveToLocalStorage();
  }
  getKeyBindings(context: string): Record<string, string> {
    return this.config[context]?.key ?? {};
  }

  getConfig(): CommandMap {
    return this.config;
  }

  setConfig(newConfig: CommandMap): void {
    this.config = newConfig;
    this.saveToLocalStorage();
  }

  exportSettings(): CommandSettings {
    return { commandSettings: this.config };
  }

  importSettings(settings: Partial<CommandSettings>): boolean {
    if (settings.commandSettings) {
      this.setConfig(settings.commandSettings);
      return true;
    }
    return false;
  }

  private saveToLocalStorage(): void {
    localStorage.setItem('commandConfig', JSON.stringify(this.config));
  }

  private loadFromLocalStorage(): void {
    const saved = localStorage.getItem('commandConfig');
    if (saved) {
      try {
        this.config = JSON.parse(saved);
      } catch {
        console.warn('Configurazione comandi corrotta. Reset in corso.');
      }
    }
  }

  getContexts(): string[] {
    return Object.keys(this.config);
  }

  getAvailableCommands(): string[] {
    return ['addToDeck', 'zoom', 'selectCard', 'none'];
  }
}
