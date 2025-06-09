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
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BoardStateService {
  private readonly storageKey = 'boardStateCache';
  private myUserId: string = '';

  private selfBoardSubject = new BehaviorSubject<CardWithDelta[]>([]);
  private opponentBoardSubject = new BehaviorSubject<CardWithDelta[]>([]);

  selfBoard$ = this.selfBoardSubject.asObservable();
  opponentBoard$ = this.opponentBoardSubject.asObservable();

  setMyUserId(userId: string): void {
    this.myUserId = userId;
  }

  reset(): void {
    this.selfBoardSubject.next([]);
    this.opponentBoardSubject.next([]);
  }
  applyGameUpdate(gameState: any): void {
    const prevSelf = this.selfBoardSubject.getValue();
    const prevOpponent = this.opponentBoardSubject.getValue();

    const selfBoard: CardWithDelta[] = [];
    const opponentBoard: CardWithDelta[] = [];

    for (const userId of Object.keys(gameState.boards)) {
      const serverBoard = gameState.boards[userId];
      const side = userId === this.myUserId ? 'self' : 'opponent';

      const previousBoard = side === 'self' ? prevSelf : prevOpponent;

      const processedBoard = serverBoard.map((serverCard: any) => {
        const previous = previousBoard.find((c) => c.id === serverCard.id);

        // SE previous non esiste → PRIMO CARICAMENTO
        const baseAttack = previous ? previous.baseAttack : serverCard.attack;
        const baseDefense = previous
          ? previous.baseDefense
          : serverCard.defense;

        const deltaAttack = serverCard.attack - baseAttack;
        const deltaDefense = serverCard.defense - baseDefense;

        return {
          ...serverCard,
          baseAttack,
          baseDefense,
          deltaAttack,
          deltaDefense,
          currentEffect: previous?.currentEffect ?? null,
        };
      });

      if (side === 'self') selfBoard.push(...processedBoard);
      if (side === 'opponent') opponentBoard.push(...processedBoard);
    }

    this.selfBoardSubject.next(selfBoard);
    this.opponentBoardSubject.next(opponentBoard);
  }

  assignEffectToCard(cardId: string, effectType: string): void {
    const updateBoard = (board: CardWithDelta[]): CardWithDelta[] => {
      return board.map((c) =>
        c.id === cardId ? { ...c, currentEffect: effectType } : c
      );
    };

    this.selfBoardSubject.next(updateBoard(this.selfBoardSubject.getValue()));
    this.opponentBoardSubject.next(
      updateBoard(this.opponentBoardSubject.getValue())
    );
  }
  clearEffects() {
    const clearBoard = (board: CardWithDelta[]): CardWithDelta[] => {
      return board.map((c: any) => ({ ...c, currentEffect: null }));
    };

    this.selfBoardSubject.next(clearBoard(this.selfBoardSubject.getValue()));
    this.opponentBoardSubject.next(
      clearBoard(this.opponentBoardSubject.getValue())
    );
  }
}
