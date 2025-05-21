import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Subject } from 'rxjs';
import { Router } from '@angular/router'; // Importa Router per la navigazione
import { environment } from '../environments/environment';
import { getDecodedToken } from '../app/auth/login/jwt-decoder';
import { GameState } from '../app/shared/model/game-model';
import { AnimationOverlayService } from './animation-service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  private gameStartedSubject = new BehaviorSubject<any | null>(null); // Nuovo subject per quando la partita inizia
  gameUpdateSubject = new BehaviorSubject<any | null>(null);
  // Per aggiornamenti sullo stato della partita
  private reconnectSubject = new Subject<void>();
  private waitLogin = new BehaviorSubject<any | null>(null);
  private cardDrawnSubject = new Subject<any>();

  private gameResultSubject = new Subject<{
    result: 'win' | 'lose';
    message: string;
  }>();
  gameResult$ = this.gameResultSubject.asObservable();

  username;
  constructor(
    private router: Router,
    private overlay: AnimationOverlayService
  ) {
    // Assicurati di avere il URL corretto per il tuo server
    this.socket = io(environment.socketUrl);

    this.socket.on('card-drawn', (data) => {
      console.log('stai pescando', data);
      this.overlay.showCardDrawn(data.card, data.frame);
    });

    this.socket.on('you-won', (data) => {
      this.gameResultSubject.next({ result: 'win', message: data.message });
      this.endGame();
    });

    this.socket.on('you-lost', (data) => {
      this.gameResultSubject.next({ result: 'lose', message: data.message });
      this.endGame();
    });
    // Ascolta quando la partita è pronta e redirige al game board
    this.socket.on('game-started', (gameData) => {
      this.gameStartedSubject.next(gameData); // Notifica l'inizio della partita
    });

    // Ascolta gli aggiornamenti sulla partita
    this.socket.on('game-update', (gameState) => {
      this.gameUpdateSubject.next(gameState); // Invia aggiornamenti sullo stato della partita
    });
    // On successful reconnect
    this.socket.on('reconnect', () => {
      this.reconnectSubject.next();
    });
    this.socket.on('login-error', (error) => {
      localStorage.removeItem('token');
      // Qui puoi aggiungere anche la logica di logout vera e propria
      alert(error);
      this.router.navigate(['/login']);
    });
    this.socket.on('do-login', () => {
      this.socketLogin();
    });
    this.socket.on('login-succes', (val) => {
      this.waitLogin.next(true);
    });
    this.socket.on('abort-match', (val) => {});
    this.socket.on('matchmaking-error', (val) => {
      this.gameStartedSubject.next(false);
      console.log(val);
      alert(val.error);
    });
    this.socket.on('action-error', (val) => {
      // this.gameStartedSubject.next(false);
      console.log(val);
      alert(val.error);
    });
  }

  playCard(gameId: string, data: { cardId: string; index: number }) {
    this.socket.emit('play-card', {
      gameId,
      cardId: data.cardId,
      index: data.index,
    });
  }
  //socketLogin
  socketLogin() {
    const token = localStorage.getItem('token');
    console.log(token);
    if (token) this.socket.emit('login', { token: token });
    else {
      localStorage.removeItem('token');
      //   Qui puoi aggiungere anche la logica di logout vera e propria
      this.router.navigate(['/login']);
    }
  }
  // Matchmaking 1v1
  matchmaking(mode) {
    this.socket.emit('matchmaking', { mode: mode });
  }

  // Ascolta per l'inizio della partita
  onGameStarted() {
    return this.gameStartedSubject.asObservable();
  }

  // Ascolta per gli aggiornamenti sullo stato della partita
  onGameUpdate() {
    return this.gameUpdateSubject.asObservable();
  }

  onCardDrawn() {
    return this.cardDrawnSubject.asObservable();
  }
  // Metodo per disconnettersi dal server
  disconnect() {
    this.socket.disconnect();
  }

  getSocket() {
    return this.socket;
  }
  /**
   * Osserva la riconnessione automatica del socket e
   * permette di rientrare in partita.
   */
  onReconnect() {
    return this.reconnectSubject.asObservable();
  }
  getwaitLogin() {
    return this.waitLogin.asObservable();
  }
  endGame() {
    this.gameStartedSubject.next(false); // Notifica l'inizio della partita
    this.gameUpdateSubject.next(false);
  }
}
