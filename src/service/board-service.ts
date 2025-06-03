import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BoardStateService {
  private readonly storageKey = 'boardStateCache';

  private myUserId: string = ''; // 👈 serve per distinguere self/opponent

  private board: {
    self: CardWithDelta[];
    opponent: CardWithDelta[];
  } = { self: [], opponent: [] };

  constructor() {
    this.loadFromCache();
  }

  setMyUserId(userId: string): void {
    this.myUserId = userId;
  }

  private loadFromCache(): void {
    const raw = localStorage.getItem(this.storageKey);
    this.board = raw ? JSON.parse(raw) : { self: [], opponent: [] };
  }

  private saveToCache(): void {
    localStorage.setItem(this.storageKey, JSON.stringify(this.board));
  }

  reset(): void {
    this.board = { self: [], opponent: [] };
    this.saveToCache();
  }

  applyGameUpdate(gameState: any): void {
    const prevBoard = structuredClone(this.board);

    const updatedBoard = { self: [], opponent: [] };

    for (const userId of Object.keys(gameState.boards)) {
      const serverBoard = gameState.boards[userId];
      const side = userId === this.myUserId ? 'self' : 'opponent';

      updatedBoard[side] = serverBoard.map((serverCard: any) => {
        const previous = prevBoard[side]?.find((c) => c.id === serverCard.id);

        let baseAttack = previous?.baseAttack ?? serverCard.attack;
        let baseDefense = previous?.baseDefense ?? serverCard.defense;

        const deltaAttack = serverCard.attack - baseAttack;
        const deltaDefense = serverCard.defense - baseDefense;

        return {
          ...serverCard,
          baseAttack,
          baseDefense,
          deltaAttack,
          deltaDefense,
          currentEffect: previous?.currentEffect ?? null, // preserva effetto visivo se presente
        };
      });
    }

    this.board = updatedBoard;
    this.saveToCache();
  }

  getPlayerBoardSelf(): CardWithDelta[] {
    return this.board.self;
  }

  getPlayerBoardOpponent(): CardWithDelta[] {
    return this.board.opponent;
  }

  getFullBoard(): { self: CardWithDelta[]; opponent: CardWithDelta[] } {
    return this.board;
  }

  assignEffectToCard(cardId: string, effectType: string): void {
    for (const side of ['self', 'opponent'] as const) {
      const foundCard = this.board[side].find((c) => c.id === cardId);
      if (foundCard) {
        foundCard.currentEffect = effectType;
        break;
      }
    }
    this.saveToCache();
  }
}

export interface CardWithDelta {
  _id: string;
  id: string;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  image: string;
  type: 'HERO' | 'MAGIC';
  abilities?: string[];
  description?: string;
  justPlayed?: boolean;
  canAttack?: boolean;
  effect?: {
    type: string;
    trigger?: string;
    value?: number | { attack?: number; defense?: number };
    target?: string | string[] | { condition: string };
    count?: number;
    mode?: string;
    duration?: number;
    subtype?: string;
    intoCardId?: string;
  };
  freezeCounter?: number;
  highlightVisualState?: any;
  currentEffect?: string;

  baseAttack: number;
  baseDefense: number;
  deltaAttack: number;
  deltaDefense: number;
}
