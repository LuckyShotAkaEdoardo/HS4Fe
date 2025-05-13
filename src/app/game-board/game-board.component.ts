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
import { GameState } from '../shared/model/game-model';
import { AudioService, SoundEffect } from '../../service/audio-service';
import { DisplaySettingsService } from '../../service/display-settings.service';
import { DoubleTapDirective } from '../../directive/long-press.directive';
import { CardService } from '../../service/card.service';

interface Card {
  id: string;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  effect: string;
  image: string;
  type: 'HERO' | 'MAGIC';
  justPlayed?: boolean;
}

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
  };

  currentPlayerName = '';
  playerCrystals = 0;
  cardsInHand: Card[] = [];
  board: Card[] = [];
  isLoading = true;
  team = '';
  selectedCards: any[] = [];
  opponentBoard: Card[] = [];
  opponentId = '';
  frameSelected;
  baseFrame;
  baseFrameBack;
  arrow: {
    start: { x: number; y: number };
    end: { x: number; y: number };
    source: any;
  } | null = null;
  username;
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
    private audioService: AudioService,
    private cardService: CardService
  ) {
    this.socket = this.socketService.getSocket();
  }
  showEndModal = false;
  endImage;
  drawnCard: any = null;
  showCardAnim = false;
  displaySettings = inject(DisplaySettingsService).settings;
  ngOnInit(): void {
    const raw = localStorage.getItem('frameSelected');
    try {
      this.frameSelected = raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('Errore parsing frameSelected:', e);
      const test = this.cardService.getCorniciList();
      this.frameSelected = test[0];
    }

    this.socket.on('game-over', (data: { winner: string }) => {
      this.showEndModal = true;
      this.endImage = data.winner === this.username ? true : false;
      this.socket.emit('leave-game', this.gameId);
    });
    console.log(this.frameSelected);
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

    this.socketService.cardDrawn$.subscribe(({ card, deckLength }) => {
      // 👇 Puoi personalizzare con animazioni
      console.log('Carta pescata:', card);
      // esempio: this.showCardDrawAnimation(card);
    });

    this.socketService.gameResult$.subscribe(({ result, message }) => {
      this.router.navigate(['/endgame'], {
        state: { result, message },
      });
    });
    this.socketService.cardDrawn$.subscribe(({ card }) => {
      this.showCardDrawn(card);
    });
  }

  private connectSocket(): void {
    this.socket.emit('join-game', this.gameId);

    this.socketService.onGameUpdate().subscribe((state) => {
      this.updateState(state);
      this.isLoading = false;
    });

    this.socket.on('turn-update', (data: any) => {
      this.playerCrystals = data.crystals;
      this._currentTurnPlayerId = data.currentPlayerId; // Salviamo l'ID del giocatore che è nel turno
      if (this._currentTurnPlayerId === this.currentPlayerId) {
        console.log('È il tuo turno!');
      }
    });

    this.socket.on('player-id', (data: any) => {
      this.currentPlayerId = data;
    });
    this.socket.on('error', (msg: string) => alert(msg));
  }
  private updateState(state: any) {
    const token = getDecodedToken();
    const username = token.username;
    this.username = username;
    this.currentPlayerId = username;
    this.gameId = state.id;
    this.gameState = state;

    // ⚠️ importante: inizializza opponentId PRIMA di usarlo
    this.opponentId = state.opponentId;

    // Accesso con chiavi username
    this.cardsInHand = state.hands?.[username] || [];
    this.board = state.boards?.[username] || [];
    this.opponentBoard = state.boards?.[this.opponentId] || [];
    this.playerCrystals = state.crystals?.[this.currentPlayerId] || 0;
    this.opponentCrystals = state.crystals?.[this.opponentId] || 0;
    this.playerCrystals = state.crystals?.[username] || 0;
    this.currentPlayerName = state.currentPlayerId;
    // this.isMyTurn = state.currentPlayerId === username;

    this.isLoading = false;
  }
  opponentCrystals;
  // Getter per verificare se è il turno del giocatore
  get isMyTurn(): boolean {
    return (
      !!this._currentTurnPlayerId &&
      !!this.currentPlayerId &&
      this._currentTurnPlayerId === this.currentPlayerId
    );
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
    this.socket.emit('play-card', { gameId: this.gameId, card });
  }

  attack(
    attacker: Card,
    target: { type: 'HERO' | 'FACE'; id?: string; playerId?: string }
  ): void {
    if (this.showEndModal) return;
    if (!this.isMyTurn) return;
    if (attacker.justPlayed) {
      alert('Questa pedina non può attaccare questo turno');
      return;
    }
    this.socket.emit('attack', { gameId: this.gameId, attacker, target });
  }

  endTurn(): void {
    console.log('sono qui');
    if (!this.isMyTurn) return;
    this.socket.emit('end-turn', this.gameId);
  }

  leaveGame(): void {
    this.socket.emit('leave-game', this.gameId);
    this.router.navigate(['/dashboard']);
  }

  setCurrentPlayerName() {
    const currentPlayer = this.players.find(
      (player) => player.id === this.currentPlayerId
    );
    this.currentPlayerName = currentPlayer ? currentPlayer.name : '';
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
  boardEnterPredicate = (drag: CdkDrag<Card>, drop: CdkDropList): boolean => {
    const card = drag.data;
    return this.isMyTurn && card.cost <= this.playerCrystals;
  };

  onDrop(event: CdkDragDrop<Card[]>): void {
    // Riordino nella mano
    if (this.showEndModal) return;
    if (event.previousContainer === event.container) {
      // riordino nella stessa lista
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
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
        this.board.splice(0, 0, draggedCard);
        event.previousContainer.data.splice(event.previousIndex, 1);
        this.socketService.playCard(this.gameId, draggedCard);
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

      const insertIndex = insertAfter ? closestIndex + 1 : closestIndex;

      // Rimuovi e inserisci
      event.previousContainer.data.splice(event.previousIndex, 1);

      draggedCard.justPlayed = true;

      this.socketService.playCard(this.gameId, draggedCard);
    }
  }
  startArrow(event: MouseEvent, card: any) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.arrow = {
      start: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      end: {
        x: event.clientX,
        y: event.clientY,
      },
      source: card,
    };
  }

  updateArrow(event: MouseEvent) {
    if (this.arrow) {
      this.arrow.end = {
        x: event.clientX,
        y: event.clientY,
      };
    }
  }

  endArrow(event: MouseEvent) {
    if (!this.arrow) return;

    const mouseX = event.clientX;
    const mouseY = event.clientY;

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
        this.attack(this.arrow.source, {
          type: 'FACE',
          playerId: this.opponentId,
        });
      }
    }

    this.arrow = null;
  }
  showCardDrawn(card: any) {
    this.drawnCard = card;
    this.showCardAnim = true;
    this.audioService.playNamed(SoundEffect.CardDraw);

    setTimeout(() => {
      this.showCardAnim = false;
      this.drawnCard = null;
    }, 1800); // durata dell'animazione
  }
}
