// src/app/components/deck-builder/deck-builder.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { Card, CardService } from '../../service/card.service';
import { GameModuleModule } from '../game-module/game-module.module';
import { Router } from '@angular/router';
import { CardComponent } from './card-component/card.component';
import { environment } from '../../environments/environment';
import { DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [GameModuleModule, DragDropModule, CardComponent],
  templateUrl: './deck-builder.component.html',
  styleUrls: ['./deck-builder.component.scss'],
})
export class DeckBuilderComponent implements OnInit {
  allCards: Card[] = [];
  deck: Card[] = [];
  cardService = inject(CardService);
  currentPage = 1;
  cardsPerPage = 10;
  addpathart = '';
  allFrame: any[] = [];
  frameSelected;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.addpathart = environment.apiUrlBase + '/images/card-img/';
    this.cardService.loadCards();
    this.allFrame = this.cardService.getCorniciList();
    this.frameSelected = this.allFrame[0];
    this.cardService.getCardsFromSubject().subscribe((cards) => {
      this.allCards = cards;
      this.allCards.sort((a, b) => a.cost - b.cost);

      console.log('all cards', this.allCards);
      this.deck = this.cardService.loadDeck();
    });
  }

  addToDeck(card: Card): void {
    const count = this.deck.filter((c) => c.id === card.id).length;

    if (this.deck.length >= 30) {
      alert('Hai raggiunto il numero massimo di 30 carte.');
      return;
    }

    if (count >= 2) {
      alert('Puoi aggiungere solo 2 copie della stessa carta.');
      return;
    }

    this.deck.push(card);
  }

  removeFromDeck(index: number): void {
    this.deck.splice(index, 1);
  }
  goBack() {
    this.router.navigate(['/dashboard']);
  }
  salva() {
    localStorage.setItem('userDeck', JSON.stringify(this.deck));
    localStorage.setItem('frameSelected', JSON.stringify(this.frameSelected));
    alert('Deck salvato con successo!');
  }
  get paginatedCards(): Card[] {
    const startIndex = (this.currentPage - 1) * this.cardsPerPage;
    return this.allCards.slice(startIndex, startIndex + this.cardsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.allCards.length / this.cardsPerPage);
  }
  refresh() {
    this.cardService.refresh();
  }
  onFrameChange(event) {
    this.frameSelected = event.value;
  }
}
