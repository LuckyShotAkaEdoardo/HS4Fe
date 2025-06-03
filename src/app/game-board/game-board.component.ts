import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
  NgZone,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
import { fromEvent, Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { CardEffectClassPipe } from '../../directive/card-effect.pipe';
import { BoardStateService, CardWithDelta } from '../../service/board-service';

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
    CardEffectClassPipe,
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
  awaitingTargetForCard: CardWithDelta | null = null;
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

  enemyBoardTemplate: any = [];

  @ViewChild('myCard') myDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('spaceHand') spaceHand!: ElementRef<HTMLDivElement>;
  @ViewChild('myboardHeight') myboardHeight!: ElementRef<HTMLDivElement>;

  @ViewChild('enemyHand') enemyHand!: ElementRef<HTMLDivElement>;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService,
    private cdr: ChangeDetectorRef,
    private cardService: CardService,
    private zone: NgZone,
    private boardStateService: BoardStateService // QUI
  ) {}
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
  board: CardWithDelta[] = [];
  opponentBoard: CardWithDelta[] = [];
  loading = true;
  boardStyle;
  vh;
  ngOnInit(): void {
    console.log(this.socket);

    try {
      this.socket = this.socketService.getSocket();
    } catch {
      if (!this.socket) {
        const token = localStorage.getItem('token');
        this.socketService.connect(token ?? '');
        this.socket = this.socketService.getSocket();
      }
    }
    const cachedBoard = this.boardStateService.getFullBoard();
    if (cachedBoard) {
      this.board = cachedBoard[this.userId] || [];
      this.opponentBoard = cachedBoard[this.opponentId] || [];
    }
    this.setBoardBackground('assets/boards/3.png');
    this.subscriptions.push(
      this.socketService.onGameStarted().subscribe((state) => {
        this.gameState = state;
        this.boardStateService.setMyUserId(state.userId);
        this.boardStateService.applyGameUpdate(state);

        this.userId = state.userId;
        this.username = state.username;
        this.gameState = state;
        this.frameSelected = state.frames?.[this.userId] || '';
        const opponentId = this.opponentId;
        this.frameSelectedOpponent = state.frames?.[opponentId] || '';
        this.playerCrystals = state.crystals?.[this.userId] || 0;
        this.opponentCrystals = state.crystals?.[opponentId] || 0;
        this._currentTurnPlayerId = state.turnInfo?.currentPlayerId;
        this.board = this.boardStateService.getPlayerBoardSelf();

        this.opponentBoard = this.boardStateService.getPlayerBoardOpponent();
        this.currentPlayerName =
          state.usernames?.[this._currentTurnPlayerId] || '';
        this.isLoading = false;
      })
    );

    this.subscriptions.push(
      this.socketService.onGameUpdate().subscribe((state) => {
        setTimeout(() => {
          // this.loading = false;
          if (!state?.gameId) return;
          this.gameState = state;
          this.boardStateService.applyGameUpdate(state);

          this.frameSelected = state.frames?.[this.userId] || '';
          this.frameSelectedOpponent = state.frames?.[this.opponentId] || '';
          this.playerCrystals = state.crystals?.[this.userId] || 0;
          this.opponentCrystals = state.crystals?.[this.opponentId] || 0;
          // this.board = [];
          // this.opponentBoard = [];
          this.board = this.boardStateService.getPlayerBoardSelf();

          this.opponentBoard = this.boardStateService.getPlayerBoardOpponent();
          this.zone.run(() => this.cdr.detectChanges());
          // this.loading = true;

          this._currentTurnPlayerId = state.turnInfo?.currentPlayerId;
          this.currentPlayerName =
            state.usernames?.[this._currentTurnPlayerId] || '';
          this.isLoading = false;

          // if (state.visualEvents) {
          //   state.visualEvents.forEach((ev: any) => {
          //     if (ev.cardId) {
          //       this.highlightCard(ev.cardId, ev.type.toLowerCase());
          //     }
          //   });
          // }
        }, 1000); //serve per far vedere le animazioni
      })
    );
    // this.eventResize();
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
      console.log('guarda history', entry);
      if (entry.details?.effects?.length) {
        entry.details.effects.forEach((effc: any) => {
          if (effc.length > 0) {
            effc.forEach((eff) => {
              if (eff.to) {
                console.log('effc.type multiplo', eff.type);
                this.assignEffectToCard(eff.to, eff.type);
              }
            });
          } else {
            if (effc.type) {
              console.log('effc.type singolo', effc.type);
              this.assignEffectToCard(effc.to, effc.type);
            }
          }
        });
      }
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
  vhToPixels(vh: number): number {
    console.log(window.innerHeight * vh);
    return (window.innerHeight * vh) / 100;
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

  get cardsInHand(): CardWithDelta[] {
    return (this.gameState?.hands?.[this.userId] as any) || [];
  }
  // updateBoard(newCards: Card[]) {
  //   for (let i = 0; i < newCards.length; i++) {
  //     const newCard = newCards[i];
  //     const oldCard = this.board[i];

  //     if (!oldCard || oldCard.id !== newCard.id) {
  //       this.board[i] = { ...newCard }; // nuova carta
  //     } else {
  //       // aggiorno i campi mutabili: hp, freeze, ecc.
  //       Object.assign(this.board[i], newCard);
  //     }
  //   }

  //   // Rimuovo carte in eccesso se necessario
  //   if (this.board.length > newCards.length) {
  //     this.board.length = newCards.length;
  //   }
  // }

  attack(
    attacker: CardWithDelta,
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
  boardEnterPredicate = (
    drag: CdkDrag<CardWithDelta>,
    drop: CdkDropList
  ): boolean => {
    const card = drag.data;
    return this.isMyTurn && card.cost <= this.playerCrystals;
  };
  awaitingTargetForCardIndex;
  onDrop(event: CdkDragDrop<CardWithDelta[]>): void {
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
        const card = event.previousContainer.data[event.previousIndex] as any;

        if (!cardId) return console.warn('Card ID mancante');
        //// PROVA QUI
        if (
          card.effect &&
          typeof card.effect.target === 'string' &&
          card.effect.target.startsWith('CHOOSE') &&
          card.effect.count &&
          card.effect.count > 0
        ) {
          console.log('scegli');
          this.awaitingTargetForCard = card;
          this.awaitingTargetForCardIndex = event.currentIndex;
          this.maxSelectableTargets = card.effect.count;
          this.selectedTargets = [];
          this.enableTargetSelectionMode(card.effect.target);
          return;
        }
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
      const card = event.previousContainer.data[event.previousIndex];
      const index = insertAfter ? closestIndex + 1 : closestIndex;
      if (!cardId) return console.warn('Card ID mancante');
      console.log('guarda qui', cardId);
      if (
        card.effect &&
        typeof card.effect.target === 'string' &&
        card.effect.target.startsWith('CHOOSE') &&
        card.effect.count &&
        card.effect.count > 0
      ) {
        console.log('scegli');
        this.awaitingTargetForCard = card;
        this.awaitingTargetForCardIndex = index;
        this.maxSelectableTargets = card.effect.count;
        this.selectedTargets = [];
        this.enableTargetSelectionMode(card.effect.target);
        return;
      }

      this.socketService.playCard(this.gameId, {
        cardId, // 👈 solo id
        index: index, // ✅ corretto
      });
    }
  }

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

  highlightCard(cardId: string, cssClass: string) {
    const el = document.querySelector(`[data-card-id="${cardId}"]`);
    if (!el) return;
    el.classList.add(`effect-${cssClass}`);
    setTimeout(() => el.classList.remove(`effect-${cssClass}`), 1000);
  }
  enableTargetSelectionMode(targetType: string) {
    const validTargetIds = this.getValidTargetIds(targetType);
    this.targetInstruction = this.getTargetInstructionLabel(targetType);
    this.selectedTargets = [];

    for (const id of validTargetIds) {
      const el = document.querySelector(`[data-card-id="${id}"]`);
      if (el) {
        el.classList.add('highlight-selectable');
        el.addEventListener('click', this.onTargetClick.bind(this, id), {
          once: true,
        });
      }
    }
  }

  onTargetClick(cardId: string) {
    this.selectedTargets.push(cardId);

    const el = document.querySelector(`[data-card-id="${cardId}"]`);
    if (el) el.classList.add('card-selected');

    if (this.selectedTargets.length >= this.maxSelectableTargets) {
      this.finalizeCardPlayWithTargets();
    }
  }

  finalizeCardPlayWithTargets() {
    const card = this.awaitingTargetForCard;
    const targets = [...this.selectedTargets];
    const targetsId = targets;
    console.log(targetsId);
    this.resetTargetSelection();
    if (!card) return;
    this.socket.emit('play-card', {
      gameId: this.gameId,
      cardId: card.id,
      index: this.awaitingTargetForCardIndex,
      targets: targets,
    });
    this.resetTargetSelectionUI();
  }
  resetTargetSelectionUI() {
    const highlighted = document.querySelectorAll('.highlight-selectable');
    highlighted.forEach((el) => el.classList.remove('highlight-selectable'));

    const selected = document.querySelectorAll('.card-selected');
    selected.forEach((el) => el.classList.remove('card-selected'));
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

      case 'CHOOSE_ENEMY_OR_FACE':
        return [...oppBoard.map((c) => c.id), `FACE:${opponentId}`];

      case 'CHOOSE_ALLY_OR_FACE':
        return [...myBoard.map((c) => c.id), `FACE:${myId}`];

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
      case 'CHOOSE_ENEMY_OR_FACE':
        return 'Scegli un nemico o il volto avversario';
      case 'CHOOSE_ALLY_OR_FACE':
        return 'Scegli una tua creatura o il tuo volto';
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

    let base = '';
    switch (entry.type) {
      case 'PLAY_CARD':
        base = `${who} ha giocato ${entry.details.cardName}`;
        break;
      case 'ATTACK':
        base = `${who} ha attaccato ${entry.details.targetId}`;
        break;
      case 'END_TURN':
        base = `${who} ha terminato il turno`;
        break;
      case 'EFFECT':
        base = `${who} ha attivato ${entry.details.effectType}`;
        break;
      case 'DRAW':
        base = `${who} ha pescato una carta`;
        break;
      default:
        base = `${who} ha fatto qualcosa`;
    }

    // Ora gestiamo eventuali effetti
    if (entry.details?.effects?.length > 0) {
      const effectsDescriptions = entry.details.effects
        .map((eff: any) => {
          switch (eff.type) {
            case 'DAMAGE':
              return `Inflitto ${eff.amount} danni a ${eff.to}`;
            case 'HEAL':
              return `Curato ${eff.amount} a ${eff.to}`;
            case 'BURN':
              return `Bruciato ${eff.to} (${eff.value})`;
            case 'FREEZE':
              return `Congelato ${eff.to} (${eff.duration} turni)`;
            case 'BUFF_ATTACK':
              return `+${eff.amount} Attacco su ${eff.to}`;
            case 'BUFF_DEFENSE':
              return `+${eff.amount} Difesa su ${eff.to}`;
            case 'SHIELD':
              return `Scudo ${eff.amount} a ${eff.to}`;
            case 'SILENCE':
              return `Silenziato ${eff.to}`;
            case 'SET_STATS':
              return `Set Stats ${eff.to} → ATK:${eff.newAttack}, DEF:${eff.newDefense}`;
            // puoi aggiungere tutti gli altri qui se vuoi
            default:
              return `${eff.type} su ${eff.to ?? '-'}`;
          }
        })
        .join(', ');

      base += ` [Effetti: ${effectsDescriptions}]`;
    }

    return base;
  }

  backgroundUrl;
  setBoardBackground(imageUrl: string) {
    this.backgroundUrl = imageUrl;
    this.boardStyle = {
      'background-image': `url(${imageUrl})`,
      'background-size': '120% auto', // <-- eccolo il trucco
      'background-position': 'center',
      'background-repeat': 'no-repeat',
    };
  }

  measureHandRatio() {
    if (!this.myDiv || !this.spaceHand) return;

    const cardRect = this.myDiv.nativeElement.getBoundingClientRect();
    const handRect = this.spaceHand.nativeElement.getBoundingClientRect();

    const containerHeight = cardRect.height;
    let cardHeight = containerHeight;
    let cardWidth = (2 / 3) * cardHeight;

    const totalWidth = handRect.width;
    const maxCards = 10;
    const gap = 8;
    const totalGaps = (maxCards - 1) * gap;
    const totalRequiredWidth = cardWidth * maxCards + totalGaps;

    if (totalRequiredWidth > totalWidth) {
      const scale = (totalWidth - totalGaps) / (cardWidth * maxCards);
      cardWidth *= scale;
      cardHeight *= scale;
    }

    // console.log('Card width:', cardWidth, 'Card height:', cardHeight);

    return { wi: cardWidth, hi: cardHeight };
  }

  measureBoardRatio() {
    if (!this.myboardHeight) return;

    const cardRect = this.myDiv.nativeElement.getBoundingClientRect();

    const containerHeight = cardRect.height;
    let cardHeight = containerHeight;
    let cardWidth = (2 / 3) * cardHeight;

    const totalWidth = cardRect.width;
    const maxCards = 10;
    const gap = 8;
    const totalGaps = (maxCards - 1) * gap;
    const totalRequiredWidth = cardWidth * maxCards + totalGaps;

    if (totalRequiredWidth > totalWidth) {
      const scale = (totalWidth - totalGaps) / (cardWidth * maxCards);
      cardWidth *= scale;
      cardHeight *= scale;
    }

    // console.log('Card width:', cardWidth, 'Card height:', cardHeight);
    return { wi: cardWidth, hi: cardHeight };
  }

  measureEnemyRatio() {
    if (!this.enemyHand) return;

    const cardRect = this.enemyHand.nativeElement.getBoundingClientRect();

    const containerHeight = cardRect.height;
    let cardHeight = containerHeight;
    let cardWidth = (2 / 3) * cardHeight;

    const totalWidth = cardRect.width;
    const maxCards = 10;
    const gap = 8;
    const totalGaps = (maxCards - 1) * gap;
    const totalRequiredWidth = cardWidth * maxCards + totalGaps;

    if (totalRequiredWidth > totalWidth) {
      const scale = (totalWidth - totalGaps) / (cardWidth * maxCards);
      cardWidth *= scale;
      cardHeight *= scale;
    }

    // console.log('Card width:', cardWidth, 'Card height:', cardHeight);
    return { wi: cardWidth, hi: cardHeight };
  }
  // handRatio;
  // enemyRatio = { wi: 10, hi: 10 } as any;
  // boardRatio;
  // eventResize() {
  //   setTimeout(() => {
  //     this.enemyRatio = this.measureEnemyRatio();
  //     this.boardRatio = this.measureBoardRatio();
  //     this.handRatio = this.measureHandRatio();
  //   }, 500);

  //   fromEvent(window, 'resize').subscribe(() => {
  //     this.enemyRatio = this.measureEnemyRatio();
  //     this.boardRatio = this.measureBoardRatio();
  //     this.handRatio = this.measureHandRatio();
  //   });
  // }
  targetClose() {
    // Reset variabili interne
    console.log('sono in reset');
    this.awaitingTargetForCard = null;
    this.awaitingTargetForCardIndex = null;
    this.maxSelectableTargets = 0;
    this.selectedTargets = [];
    this.targetInstruction = null;

    // Rimuovi highlight selezione dal DOM
    const highlighted = document.querySelectorAll('.highlight-selectable');
    highlighted.forEach((el) => el.classList.remove('highlight-selectable'));

    const selected = document.querySelectorAll('.card-selected');
    selected.forEach((el) => el.classList.remove('card-selected'));

    // Rimuove anche eventuali listener pendenti
    document.querySelectorAll('.highlight-selectable').forEach((el) => {
      const newEl = el.cloneNode(true);
      el.replaceWith(newEl);
    });
  }
  assignEffectToCard(cardId: string, effectType: string) {
    console.log('STO CERCANDO DI ASSEGGNARE EFFETTO');

    this.boardStateService.assignEffectToCard(cardId, effectType);
  }
}
