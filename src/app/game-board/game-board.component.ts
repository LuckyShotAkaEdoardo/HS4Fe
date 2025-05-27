import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { SocketService } from '../../service/socket.service';

import { environment } from '../../environments/environment';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { getDecodedToken } from '../auth/login/jwt-decoder';
import { RangePipe } from '../shared/range-pipe';
import { CardComponent } from '../shared/card-component/card.component';
import { Card, GameState } from '../shared/model/game-model';
import { AudioService, SoundEffect } from '../../service/audio-service';
import { DisplaySettingsService } from '../../service/display-settings.service';
import { DoubleTapDirective } from '../../directive/long-press.directive';
import { CardService } from '../../service/card.service';
import { VisualEvent } from '../../service/effect-mapper';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-game-board',
  standalone: true,
  imports: [
    CardComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    MaterialModule,
    RangePipe,
  ],
  providers: [RangePipe],
  templateUrl: './game-board.component.html',
  styleUrls: ['./game-board.component.css'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(20px)' }),
        animate(
          '300ms ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class GameBoardComponent implements OnInit, OnDestroy {
  gameId = '';
  players: any[] = [];
  currentPlayerId = '';
  gameState: GameState = {
    hands: {},
    health: {},
    crystals: {},
    maxCrystals: {},
    boards: {},
    allPlayers: [],
    players: [],
    opponentId: '',
    username: '',
    turn: '',
    winner: undefined,
    currentTurnIndex: 0,
    turnInfo: {},
    userIds: '',
    barrier: [],
  };
  previewIndex: number | null = null;
  isDraggingFromHand: boolean = false;

  selectedTargets: string[] = [];
  maxSelectableTargets = 0;
  awaitingTargetForCard: Card | null = null;
  currentPlayerName = '';
  playerCrystals = 0;
  // cardsInHand: Card[] = [];
  // board: Card[] = [];
  isLoading = true;
  team = '';
  selectedCards: any[] = [];
  // opponentBoard: Card[] = [];

  // opponentId = '';
  frameSelected;
  frameSelectedOpponent;
  baseFrame;
  baseFrameBack;
  arrow: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    source: any;
  } | null = null;
  username;
  arrowStartCard: any = null;
  arrowStartPos: { x: number; y: number } | null = null;
  arrowPreviewPos: { x: number; y: number } | null = null;
  hoveredTargetCardId: string | null = null;

  private socket: any;

  private reconnectSub: any;

  // Variabile per il controllo del turno
  private _currentTurnPlayerId: string = '';

  // boardTemplate: any = [];
  enemyBoardTemplate: any = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,

    private cardService: CardService
  ) {
    this.socket = this.socketService.getSocket();
  }
  userId: string = '';
  showEndModal = false;
  endImage;
  drawnCard: any = null;
  showCardAnim = false;
  displaySettings = inject(DisplaySettingsService).settings;
  opponentCrystals;
  targetInstruction: string | null = null;
  gameHistory: any[] = [];
  private subscriptions: Subscription[] = [];

  ngOnInit(): void {
    const token = getDecodedToken();
    console.log(token);

    this.subscriptions.push(
      this.socketService.onGameStarted().subscribe((state) => {
        this.gameState = state;
        this.userId = state.userId;
        this.username = state.username;
        this.gameState = state;
        this.frameSelected = state.frames?.[this.userId] || '';
        const opponentId = this.opponentId;
        this.frameSelectedOpponent = state.frames?.[opponentId] || '';
        this.playerCrystals = state.crystals?.[this.userId] || 0;
        this.opponentCrystals = state.crystals?.[opponentId] || 0;
        this._currentTurnPlayerId = state.turnInfo?.currentPlayerId;
        this.currentPlayerName =
          state.usernames?.[this._currentTurnPlayerId] || '';
        this.isLoading = false;
      })
    );

    this.subscriptions.push(
      this.socketService.onGameUpdate().subscribe((state) => {
        if (!state?.gameId) return;
        this.gameState = state;
        this.frameSelected = state.frames?.[this.userId] || '';
        this.frameSelectedOpponent = state.frames?.[this.opponentId] || '';
        this.playerCrystals = state.crystals?.[this.userId] || 0;
        this.opponentCrystals = state.crystals?.[this.opponentId] || 0;

        this._currentTurnPlayerId = state.turnInfo?.currentPlayerId;
        this.currentPlayerName =
          state.usernames?.[this._currentTurnPlayerId] || '';
        this.isLoading = false;

        if (state.visualEvents) {
          state.visualEvents.forEach((ev: any) => {
            if (ev.cardId) {
              this.highlightCard(ev.cardId, ev.type.toLowerCase());
            }
          });
        }
      })
    );

    // console.log(this.frameSelected);
    this.baseFrame = environment.frame;
    this.baseFrameBack = environment.dorso;
    this.route.queryParams.subscribe((params) => {
      this.gameId = params['gameId'] || '';
      this.team = params['team'] || '';
      this.connectSocket();
    });

    this.reconnectSub = this.socketService.onReconnect().subscribe(() => {
      this.socket.emit('join-game', this.gameId);
    });
    this.socket.on('player-id', (id: string) => {
      this.currentPlayerId = id;
    });

    this.socketService.gameResult$.subscribe(({ result, message }) => {
      this.router.navigate(['/endgame'], {
        state: { result, message },
      });
    });
    this.socket.on('history-update', (entry) => {
      this.gameHistory.push(entry);
    });

    this.socket.emit('request-history', { gameId: this.gameId });
    this.socket.on('history-data', (history) => {
      this.gameHistory = history;
    });
  }

  private connectSocket(): void {
    this.socket.emit('join-game', this.gameId);

    this.socket.on('turn-update', (data: any) => {
      this.playerCrystals = data.crystals;
      this._currentTurnPlayerId = data.currentPlayerId; // Salviamo l'ID del giocatore che è nel turno
      if (this._currentTurnPlayerId === this.currentPlayerId) {
        console.log('È il tuo turno!');
      }
    });

    this.socket.on('error', (msg: string) => alert(msg));
  }

  get isMyTurn(): boolean {
    return (
      String(this.gameState?.turnInfo?.currentPlayerId) === String(this.userId)
    );
  }

  get opponentId(): string {
    const ids = this.gameState?.userIds;
    return Array.isArray(ids)
      ? ids.find((id: string) => id !== this.userId) || ''
      : '';
  }

  get cardsInHand(): Card[] {
    return (this.gameState?.hands?.[this.userId] as any) || [];
  }

  get board(): Card[] {
    return (this.gameState?.boards?.[this.userId] as any) || [];
  }

  get opponentBoard(): Card[] {
    return (this.gameState?.boards?.[this.opponentId] as any) || [];
  }

  playCard(card: Card): void {
    if (this.showEndModal) return;
    if (!this.isMyTurn) {
      alert('Non è il tuo turno');
      return;
    }
    if (card.cost > this.playerCrystals) {
      alert('Cristalli insufficienti');
      return;
    }
    if (card.type === 'HERO' && this.board.length >= 6) {
      alert('Plancia piena');
      return;
    }
    if (
      card.effect &&
      typeof card.effect.target === 'string' &&
      card.effect.target.startsWith('CHOOSE') &&
      card.effect.count &&
      card.effect.count > 0
    ) {
      this.awaitingTargetForCard = card;
      this.maxSelectableTargets = card.effect.count;
      this.selectedTargets = [];
      this.enableTargetSelectionMode(card.effect.target);
      return;
    }

    this.socket.emit('play-card', { gameId: this.gameId, card });
  }

  attack(
    attacker: Card,
    target: { type: 'HERO' | 'FACE'; id?: string; playerId?: string }
  ): void {
    this.socket.emit('attack', { gameId: this.gameId, attacker, target });
  }

  endTurn(): void {
    console.log('sono qui');
    if (!this.isMyTurn) return;
    this.socket.emit('end-turn', this.gameId);
  }

  leaveGame(): void {
    this.socket.emit('leave-game', this.gameId);
  }

  // setCurrentPlayerName() {
  //   const currentPlayer = this.players.find(
  //     (player) => player.id === this.currentPlayerId
  //   );
  //   this.currentPlayerName = currentPlayer ? currentPlayer.name : '';
  // }

  ngOnDestroy(): void {
    this.socketService.disconnect();
  }

  getOpponentId(): string {
    return (
      this.gameState.allPlayers?.find(
        (id: string) => id !== this.currentPlayerId
      ) || ''
    );
  }
  /** Predicate used by Angular CDK to allow dropping only
   * if it's the player's turn and they have enough crystals */
  boardEnterPredicate = (drag: CdkDrag<Card>, drop: CdkDropList): boolean => {
    const card = drag.data;
    return this.isMyTurn && card.cost <= this.playerCrystals;
  };

  onDrop(event: CdkDragDrop<Card[]>): void {
    // Riordino nella mano
    if (this.showEndModal) return;
    if (event.previousContainer === event.container) {
      return;
      // // riordino nella stessa lista
    } else {
      const draggedCard = event.previousContainer.data[event.previousIndex];
      console.log(draggedCard);
      if (!this.isMyTurn || draggedCard.cost > this.playerCrystals) return;
      if (draggedCard.type === 'HERO' && this.board.length >= 6) {
        alert('Board piena');
        return;
      }

      const dropX = event.dropPoint.x;
      const cardElements = Array.from(
        document.querySelectorAll('.singleCardBoard')
      ) as HTMLElement[];

      if (cardElements.length === 0) {
        // Se la board è vuota
        const cardId = event.previousContainer.data[event.previousIndex]
          ?.id as any;

        if (!cardId) return console.warn('Card ID mancante');

        this.socketService.playCard(this.gameId, {
          cardId, // 👈 solo id
          index: event.currentIndex,
        });
        return;
      }

      let closestIndex = 0;
      let minDistance = Infinity;
      let insertAfter = false;

      for (let i = 0; i < cardElements.length; i++) {
        const el = cardElements[i];
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const distance = Math.abs(dropX - centerX);

        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
          insertAfter = dropX > centerX;
        }
      }
      const cardId = event.previousContainer.data[event.previousIndex]?.id;
      if (!cardId) return console.warn('Card ID mancante');
      console.log('guarda qui', cardId);
      const index = insertAfter ? closestIndex + 1 : closestIndex;
      this.socketService.playCard(this.gameId, {
        cardId, // 👈 solo id
        index: index, // ✅ corretto
      });
    }
  }
  // startArrow(event: MouseEvent | TouchEvent, card: Card) {
  //   const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  //   const point = this.getClientPoint(event);
  //   this.arrow = {
  //     start: {
  //       x: rect.left + rect.width / 2,
  //       y: rect.top + rect.height / 2,
  //     },
  //     end: {
  //       x: point.x,
  //       y: point.y,
  //     },
  //     source: card,
  //   };
  // }
  startArrow(event: MouseEvent | TouchEvent, card: any) {
    this.arrowStartCard = card;

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.arrowStartPos = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    this.arrowPreviewPos = null;
    this.hoveredTargetCardId = null;

    event.stopPropagation(); // evita click bubbling
  }

  // updateArrow(event: MouseEvent | TouchEvent): void {
  //   if (this.arrow) {
  //     const point = this.getClientPoint(event);
  //     this.arrow.end = {
  //       x: point.x,
  //       y: point.y,
  //     };
  //   }
  // }
  onBackgroundClick() {
    this.arrowStartCard = null;
    this.arrowStartPos = null;
    this.arrowPreviewPos = null;
    this.hoveredTargetCardId = null;
  }
  onHoverTarget(card: any) {
    if (this.arrowStartCard) {
      this.hoveredTargetCardId = card.id;
    }
  }

  onLeaveTarget(card: any) {
    if (this.hoveredTargetCardId === card.id) {
      this.hoveredTargetCardId = null;
    }
  }
  onMouseMove(event: MouseEvent) {
    if (!this.arrowStartCard || !this.arrowStartPos) {
      return; // non fare nulla se la freccia non è iniziata
    }

    this.arrowPreviewPos = {
      x: event.clientX,
      y: event.clientY,
    };
  }
  onHoverFaceTarget() {
    if (this.arrowStartCard) {
      this.hoveredTargetCardId = 'face';
    }
  }

  onLeaveFaceTarget() {
    if (this.hoveredTargetCardId === 'face') {
      this.hoveredTargetCardId = null;
    }
  }
  confirmArrowToFace(event: MouseEvent) {
    if (this.arrowStartCard && this.hoveredTargetCardId === 'face') {
      this.attack(this.arrowStartCard, {
        type: 'FACE',
        playerId: this.opponentId,
      });

      this.onBackgroundClick();
      event.stopPropagation();
    }
  }
  confirmArrow(targetCard: any, event: MouseEvent) {
    if (this.arrowStartCard && this.hoveredTargetCardId === targetCard.id) {
      this.attack(this.arrowStartCard, {
        type: 'HERO',
        playerId: this.opponentId,
        id: targetCard.id,
      });

      this.onBackgroundClick();
      event.stopPropagation();
    }
  }

  endArrow(event: MouseEvent | TouchEvent): void {
    if (!this.arrow) return;
    const point = this.getClientPoint(event);
    const mouseX = point.x;
    const mouseY = point.y;

    // 1. Controlla se ha colpito una creatura avversaria
    const enemyEls = document.querySelectorAll('.cards-board .singleCardBoard');
    for (const [index, el] of Array.from(enemyEls).entries()) {
      const rect = el.getBoundingClientRect();
      const isInside =
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

      if (isInside) {
        const target = this.opponentBoard?.[index];
        if (target) {
          this.attack(this.arrow.source, {
            ...target,
            type: 'HERO',
            playerId: this.opponentId,
          });
          this.arrow = null;
          return;
        }
      }
    }

    // 2. Altrimenti, controlla se ha colpito la faccia dell'avversario
    const faceEl = document.querySelector('.cards-enemy');
    if (faceEl) {
      const rect = faceEl.getBoundingClientRect();
      const isInside =
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

      if (isInside) {
      }
    }

    this.arrow = null;
  }

  getClientPoint(event: MouseEvent | TouchEvent): { x: number; y: number } {
    if (event instanceof MouseEvent) {
      return { x: event.clientX, y: event.clientY };
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      return {
        x: event.touches[0].clientX,
        y: event.touches[0].clientY,
      };
    }
    return { x: 0, y: 0 };
  }
  // showCardDrawn(card: any) {
  //   this.drawnCard = card;
  //   this.showCardAnim = true;

  //   setTimeout(() => {
  //     this.showCardAnim = false;
  //     this.drawnCard = null;
  //   }, 1800); // durata dell'animazione
  // }

  highlightCard(cardId: string, cssClass: string) {
    const el = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!el) return;
    el.classList.add(`effect-${cssClass}`);
    setTimeout(() => el.classList.remove(`effect-${cssClass}`), 1000);
  }
  enableTargetSelectionMode(targetType: string) {
    const validTargetIds = this.getValidTargetIds(targetType);
    this.targetInstruction = this.getTargetInstructionLabel(targetType);
    for (const id of validTargetIds) {
      const el = document.querySelector(`[data-card-id="${id}"]`);
      if (el) el.classList.add('highlight-selectable');
      el?.addEventListener('click', this.onTargetClick.bind(this, id), {
        once: true,
      });
    }
  }

  onTargetClick(cardId: string) {
    this.selectedTargets.push(cardId);

    if (this.selectedTargets.length >= this.maxSelectableTargets) {
      this.finalizeCardPlayWithTargets();
    }
  }
  finalizeCardPlayWithTargets() {
    const card = this.awaitingTargetForCard;
    const targets = [...this.selectedTargets];

    this.resetTargetSelection();
    if (!card) return;
    this.socket.emit('play-card', {
      gameId: this.gameId,
      cardId: card.id,
      targets,
    });
  }
  resetTargetSelection() {
    this.awaitingTargetForCard = null;
    this.maxSelectableTargets = 0;
    this.selectedTargets = [];
    this.targetInstruction = null;

    document.querySelectorAll('.highlight-selectable').forEach((el) => {
      el.classList.remove('highlight-selectable');
      const newEl = el.cloneNode(true);
      el.replaceWith(newEl); // remove all listeners
    });
  }
  getValidTargetIds(targetType: string): string[] {
    const myId = this.userId;
    const opponentId = this.gameState.opponentId;
    const myBoard = this.gameState.boards[myId] || [];
    const oppBoard = this.gameState.boards[opponentId] || [];

    switch (targetType) {
      case 'CHOOSE_ANY':
        return [...myBoard, ...oppBoard].map((c) => c.id);

      case 'CHOOSE_ENEMY':
        return oppBoard.map((c) => c.id);

      case 'CHOOSE_ALLY':
        return myBoard.map((c) => c.id);

      default:
        return [];
    }
  }
  getTargetInstructionLabel(type: string): string {
    switch (type) {
      case 'CHOOSE_ALLY':
        return 'Scegli una tua creatura';
      case 'CHOOSE_ENEMY':
        return 'Scegli un nemico';
      case 'CHOOSE_ANY':
        return 'Scegli un bersaglio';
      default:
        return 'Scegli bersaglio';
    }
  }
  isTargetSelectable(id: string): boolean {
    return (
      this.targetInstruction != null &&
      this.getValidTargetIds(
        (this.awaitingTargetForCard?.effect?.target || '') as any
      ).includes(id)
    );
  }
  updatePreviewIndex(event: MouseEvent | TouchEvent): void {
    if (!this.isDraggingFromHand) return;
    const boardEl = document.getElementById('boardDropList');
    if (!boardEl) return;

    const x =
      event instanceof MouseEvent
        ? event.clientX
        : event.touches?.[0]?.clientX ?? 0;

    const cards = Array.from(boardEl.querySelectorAll('.singleCardBoard'));

    for (let i = 0; i < cards.length; i++) {
      const rect = (cards[i] as HTMLElement).getBoundingClientRect();
      if (x < rect.left + rect.width / 2) {
        this.previewIndex = i;
        return;
      }
    }

    this.previewIndex = cards.length;
  }

  clearPreviewIndex(): void {
    this.previewIndex = null;
  }
  getIcon(type: string): string {
    switch (type) {
      case 'PLAY_CARD':
        return '🃏';
      case 'ATTACK':
        return '⚔️';
      case 'END_TURN':
        return '🔄';
      case 'EFFECT':
        return '✨';
      case 'DRAW':
        return '📥';
      default:
        return '❔';
    }
  }

  formatEntry(entry: any): string {
    const who = entry.actor === this.userId ? 'Tu' : 'Avversario';
    switch (entry.type) {
      case 'PLAY_CARD':
        return `${who} ha giocato ${entry.details.cardName}`;
      case 'ATTACK':
        return `${who} ha attaccato ${entry.details.targetId}`;
      case 'END_TURN':
        return `${who} ha terminato il turno`;
      case 'EFFECT':
        return `${who} ha attivato ${entry.details.effectType}`;
      case 'DRAW':
        return `${who} ha pescato una carta`;
      default:
        return `${who} ha fatto qualcosa`;
    }
  }
}
