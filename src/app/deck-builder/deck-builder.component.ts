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
    if (this.deckSelectedId !== undefined && this.deckSelectedId !== null) {
      const IdToSave = this.deck.map((x) => x._id);
      this.decks[this.deckSelectedId].cards = IdToSave;
      this.decks[this.deckSelectedId].frame = this.frameSelected;
    }
    this.showDeck = false;
    this.deckSelectedId = '';
  }
  base64: string = '';
  encodeCompactDeck() {
    const idBytes = new Uint8Array(
      this.decks[this.deckSelectedId].cards.length * 12
    );
    console.log('GURADA Qui', this.decks[this.deckSelectedId].cards);
    this.decks[this.deckSelectedId].cards.forEach((hexId, i) => {
      if (hexId.length !== 24)
        throw new Error('Invalid MongoDB ObjectId: ' + hexId);
      for (let j = 0; j < 12; j++) {
        const byte = parseInt(hexId.substr(j * 2, 2), 16);
        idBytes[i * 12 + j] = byte;
      }
    });

    const base64 = this.base64urlEncode(idBytes);
    this.base64 = `D:${base64}`;
  }
  decodeCompactDeck(code: string): string[] {
    if (!code.startsWith('D:')) throw new Error('Invalid deck code');

    const base64 = code.slice(2);
    const bytes = this.base64urlDecode(base64);

    if (bytes.length % 12 !== 0) throw new Error('Corrupted deck code');

    const deck: string[] = [];
    for (let i = 0; i < bytes.length; i += 12) {
      let hex = '';
      for (let j = 0; j < 12; j++) {
        hex += bytes[i + j].toString(16).padStart(2, '0');
      }
      deck.push(hex);
    }
    return deck;
  }
  base64urlEncode(bytes: Uint8Array): string {
    const bin = String.fromCharCode(...bytes);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  base64urlDecode(base64: string): Uint8Array {
    const padded = base64
      .padEnd(Math.ceil(base64.length / 4) * 4, '=')
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const bin = atob(padded);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) {
      bytes[i] = bin.charCodeAt(i);
    }
    return bytes;
  }
  copied: boolean = false;

  copyDeckCode(): void {
    const input = document.getElementById('deck-code') as HTMLInputElement;
    if (!input) return;

    input.select();
    input.setSelectionRange(0, 99999); // For mobile
    document.execCommand('copy');

    this.copied = true;
    setTimeout(() => (this.copied = false), 2000);
  }
  importFromClipboard(): void {
    if (!navigator.clipboard) {
      alert('Clipboard API non supportata dal browser.');
      return;
    }

    navigator.clipboard.readText().then((text) => {
      if (!text.startsWith('D:')) {
        alert('Nessun codice deck valido negli appunti.');
        return;
      }

      try {
        const deck = this.decodeCompactDeck(text);
        console.log(deck); // usa la tua funzione esistente

        this.deck = deck
          .map((id) => this.allCards.find((c) => c._id === id || c.id === id))
          .filter((c) => c !== undefined);
        this.deckSelectedId = deck;
        this.showDeck = true; // this.deck = deck.map((id) => ({ _id: id })); // o struttura che ti serve
      } catch (e) {
        alert("Errore durante l'import del deck.");
      }
    });
  }
}
