// src/app/components/deck-builder/deck-builder.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CardService } from '../../service/card.service';
import { GameModuleModule } from '../game-module/game-module.module';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CardComponent } from '../shared/card-component/card.component';
import { DoubleTapDirective } from '../../directive/long-press.directive';
import { DeckService } from '../../service/deck-service';
import { Card } from '../shared/model/game-model';

@Component({
  selector: 'app-deck-builder',
  standalone: true,
  imports: [
    GameModuleModule,
    DragDropModule,
    CardComponent,
    DoubleTapDirective,
  ],
  templateUrl: './deck-builder.component.html',
  styleUrls: ['./deck-builder.component.scss'],
})
export class DeckBuilderComponent implements OnInit {
  allCards: Card[] = [];
  deck: Card[] = [];
  cardService = inject(CardService);
  deckService = inject(DeckService);
  currentPage = 1;
  cardsPerPage = 10;
  positions = ['d1', 'd2', 'd3', 'd4', 'd5'];
  allFrame: any[] = [];
  frameSelected;
  decks: any[] = [];
  constructor(private router: Router) {}

  ngOnInit(): void {
    let username = localStorage.getItem('username') ?? '';
    this.deckService.initDecks(username).subscribe((res: any) => {
      console.log(res);
      this.decks = res.decks;
    });
    this.allFrame = this.cardService.getCorniciList();
    this.frameSelected = this.allFrame[0].img;
    this.cardService.loadCards();

    this.cardService.getCardsFromSubject().subscribe((cards) => {
      this.allCards = cards;
      this.allCards.sort((a, b) => a.cost - b.cost);

      console.log('all cards', this.allCards);
      // this.deck = this.cardService.loadDeck();
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
    // localStorage.setItem('userDeck', JSON.stringify(this.deck));
    // localStorage.setItem('frameSelected', JSON.stringify(this.frameSelected));
    if (this.deckSelectedId !== undefined && this.deckSelectedId !== null) {
      const IdToSave = this.deck.map((x) => x._id);
      this.decks[this.deckSelectedId].cards = IdToSave;
      this.decks[this.deckSelectedId].frame = this.frameSelected;
    }
    let username = localStorage.getItem('username') ?? '';
    this.deckService.updateDecks(username, this.decks).subscribe((res: any) => {
      alert('Deck salvato con successo!');
    });
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
    console.log(event);
    this.frameSelected = event;
  }
  selectDeck(count: number): void {
    const deck = this.decks[count];
    console.log('Deck selezionato:', deck);

    if (deck.cards.length < 30) {
      alert('Non puoi selezionare un deck con meno di 30 carte');
      return;
    }

    this.decks.forEach((d, i) => {
      d.isSelected = i === count;
    });
  }
  showDeck = false;
  deckSelectedId;
  editDeck(deck) {
    console.log(deck);
    const cardIds = this.decks[deck].cards;

    this.deck = cardIds
      .map((id) => this.allCards.find((c) => c._id === id || c.id === id))
      .filter((c) => c !== undefined);
    this.deckSelectedId = deck;
    this.showDeck = true;
  }
  showDeckMethod() {
    const IdToSave = this.deck.map((x) => x._id);
    this.decks[this.deckSelectedId].cards = IdToSave;
    this.decks[this.deckSelectedId].frame = this.frameSelected;
    this.showDeck = false;
    this.deckSelectedId = '';
  }
}
