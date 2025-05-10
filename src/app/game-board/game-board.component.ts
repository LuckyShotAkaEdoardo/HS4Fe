import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { SocketService } from '../../service/socket.service';
import { CardComponent } from '../deck-builder/card-component/card.component';
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
  getData() {
    return this.gameState.players?.find((p) => p.id === this.opponentId)?.name;
  }
  gameId = '';
  players: any[] = [];
  currentPlayerId = '';
  gameState: any = {};
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

  private socket: any;

  private reconnectSub: any;

  // Variabile per il controllo del turno
  private _currentTurnPlayerId: string = '';

  // boardTemplate: any = [];
  enemyBoardTemplate: any = [];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {
    this.socket = this.socketService.getSocket();
  }

  ngOnInit(): void {
    this.frameSelected = JSON.parse(
      localStorage.getItem('frameSelected') ?? ''
    );
    console.log(this.frameSelected);
    this.baseFrame = environment.apiUrlBase + '/images/card-img/';
    this.baseFrameBack = environment.apiUrlBase + '/images/card-img/dorso/';
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
  username;
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
    if (!this.isMyTurn) return;
    if (attacker.justPlayed) {
      alert('Questa pedina non può attaccare questo turno');
      return;
    }
    this.socket.emit('attack', { gameId: this.gameId, attacker, target });
  }

  endTurn(): void {
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
      // if (
      //   event.container.id === 'handDropList' &&
      //   event.previousContainer.id === 'handDropList'
      // ) {
      //   moveItemInArray(
      //     this.cardsInHand,
      //     event.previousIndex,
      //     event.currentIndex
      //   );
      //   return;
      // }
    }
    // // Play sulla board
    // if (
    //   event.container.id === 'boardDropList' &&
    //   event.previousContainer.id === 'handDropList'
    // ) {
    //   const draggedCard = event.item.data as Card;
    //   if (!this.isMyTurn || draggedCard.cost > this.playerCrystals) return;
    //   if (draggedCard.type === 'HERO' && this.board.length >= 6) {
    //     alert('Board piena');
    //     return;
    //   }
    //   transferArrayItem(
    //     event.previousContainer.data,
    //     event.container.data,
    //     event.previousIndex,
    //     event.currentIndex
    //   );
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
}
