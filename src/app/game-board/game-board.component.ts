import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { SocketService } from '../../service/socket.service';

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
  imports: [CommonModule, RouterModule, FormsModule, MaterialModule],
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
  private socket: any;

  private reconnectSub: any;

  // Variabile per il controllo del turno
  private _currentTurnPlayerId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private socketService: SocketService
  ) {
    this.socket = this.socketService.getSocket();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.gameId = params['gameId'] || '';
      this.team = params['team'] || '';
      this.connectSocket();
    });

    this.reconnectSub = this.socketService.onReconnect().subscribe(() => {
      this.socket.emit('join-game', this.gameId);
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

  private updateState(state: any): void {
    this.gameState = state || {};
    this.players = state.teams || [];

    this.playerCrystals = state.crystals?.[this.currentPlayerId] || 0;
    this.cardsInHand = state.hands?.[this.currentPlayerId] || [];
    this.board = state.boards?.[this.currentPlayerId] || [];
    const all = state.allPlayers || [];
    this.opponentId =
      all.find((id: string) => id !== this.currentPlayerId) || '';
    this.opponentBoard = state.boards?.[this.opponentId] || [];
    this.currentPlayerName =
      this.players.find((p) => p.id === this.currentPlayerId)?.name || '';
  }

  // Getter per verificare se è il turno del giocatore
  get isMyTurn(): boolean {
    return this._currentTurnPlayerId === this.currentPlayerId;
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
    target: { type: 'HERO' | 'HP'; id?: string; playerId?: string }
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
}
