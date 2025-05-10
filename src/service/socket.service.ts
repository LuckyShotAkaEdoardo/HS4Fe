import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';
import { Router } from '@angular/router'; // Importa Router per la navigazione
import { environment } from '../environments/environment';
import { getDecodedToken } from '../app/auth/login/jwt-decoder';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket;

  private gameStartedSubject = new Subject<any>(); // Nuovo subject per quando la partita inizia
  private gameUpdateSubject = new Subject<any>(); // Per aggiornamenti sullo stato della partita
  private reconnectSubject = new Subject<void>();
  private waitLogin = new Subject<void>();
  username;
  constructor(private router: Router) {
    // Assicurati di avere il URL corretto per il tuo server
    this.socket = io(environment.socketUrl);

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
    this.socket.on('login-error', () => {
      localStorage.removeItem('token');
      // Qui puoi aggiungere anche la logica di logout vera e propria
      this.router.navigate(['/login']);
    });
    this.socket.on('do-login', () => {
      this.socketLogin();
    });
    this.socket.on('login-succes', (val) => {
      this.waitLogin.next(val);
    });
    this.socket.on('abort-match', (val) => {});
  }
  playCard(gameId, draggedCard) {
    this.socket.emit('play-card', {
      gameId: gameId,
      card: draggedCard,
    });
  }
  //socketLogin
  socketLogin() {
    const token = getDecodedToken();
    console.log();
    this.username = localStorage.getItem('username');
    if (token.username) this.socket.emit('login', { username: token.username });
  }
  // Matchmaking 1v1
  matchmaking1v1(deck) {
    if (!this.username) {
      return this.socket.emit('error', 'Devi prima effettuare il login.');
    } else {
      this.socket.emit('matchmaking-1v1', deck);
      return 'start';
    }
  }
  // Matchmaking 2v2
  matchmaking2v2() {
    this.socket.emit('matchmaking-2v2');
  }

  // Matchmaking contro NPC
  matchmakingVsNpc() {
    this.socket.emit('matchmaking-vs-npc');
  }

  // Ascolta per l'inizio della partita
  onGameStarted() {
    return this.gameStartedSubject.asObservable();
  }

  // Ascolta per gli aggiornamenti sullo stato della partita
  onGameUpdate() {
    return this.gameUpdateSubject.asObservable();
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
}
