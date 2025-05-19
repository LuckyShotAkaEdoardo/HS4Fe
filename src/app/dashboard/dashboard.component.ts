import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../../service/socket.service';

import { CardService } from '../../service/card.service';
import { GameModuleModule } from '../game-module/game-module.module';
import { getDecodedToken } from '../auth/login/jwt-decoder';

@Component({
  selector: 'app-dashboard',
  imports: [GameModuleModule],
  providers: [],
  standalone: true,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  loading = false;
  cards: any[] = []; // Per memorizzare le carteù
  // deck = [];
  disabled = true;
  constructor(
    private socketService: SocketService,
    private router: Router,
    private cardService: CardService // Inietta il CardService
  ) {
    // Naviga automaticamente quando la partita inizia
  }
  ngOnInit(): void {
    // this.cardService.loadCards();
    // this.loadCards();

    this.socketService.getwaitLogin().subscribe((gameInfo) => {
      this.disabled = false;
    });
    this.socketService.onGameStarted().subscribe((gameInfo) => {
      if (gameInfo) {
        this.router.navigate(['/game'], {
          queryParams: { gameId: gameInfo.gameId, team: gameInfo.team },
        });
      }
      this.loading = false;
    });
    this.socketService.onReconnect().subscribe((gameInfo: any) => {
      this.loading = false;
      this.router.navigate(['/game'], {
        queryParams: { gameId: gameInfo.gameId, team: gameInfo.team },
      });
    });
  }
  // Funzione per caricare le carte
  loadCards(): void {
    this.cardService.getCardsFromSubject().subscribe((cards) => {
      this.cards = cards;
    });
  }
  joinQueue(mode: '1v1' | '2v2' | 'vsBot') {
    this.loading = true;
    this.socketService.matchmaking(mode);
  }

  isAuthenticated(): boolean {
    // Verifica se l'utente è autenticato
    return localStorage.getItem('token') !== null;
  }
  goToUserInfo() {
    this.router.navigate(['/user-info']);
  }
  logout() {
    localStorage.removeItem('token');
    // Qui puoi aggiungere anche la logica di logout vera e propria
    this.router.navigate(['/login']);
  }
  goToDeckBuild() {
    this.router.navigate(['/deck-build']);
  }
  // // Un giocatore entra in una partita esistente
  // joinGame(gameId: string) {
  //   this.socket.emit("join-game", gameId);
  //   this.router.navigate([`/game/${gameId}`]);
  // }
}
