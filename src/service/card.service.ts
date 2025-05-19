// src/app/service/card.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import * as LZString from 'lz-string';
import { environment } from '../environments/environment';
import { Card } from '../app/shared/model/game-model';

@Injectable({
  providedIn: 'root',
})
export class CardService {
  private apiUrlCard = '/api/cards'; // URL dell'API delle carte
  private cardsSubject = new BehaviorSubject<Card[]>([]); // BehaviorSubject per la reattività
  isCardsLoaded = false;

  constructor(private http: HttpClient) {}

  // Funzione per ottenere le carte dal server
  getCards(): Observable<any> {
    return this.http.get<any>(environment.apiUrlDeck + '/allcard');
  }
  // Funzione per caricare le carte e aggiornarle nel Signal
  loadCards(): void {
    // Controlla se le carte sono già memorizzate nel localStorage
    // const savedCards = localStorage.getItem('cards');
    // if (savedCards) {
    //   // Se ci sono carte salvate, decompresse e caricale
    //   const decompressed = LZString.decompress(savedCards);
    //   const cards = JSON.parse(decompressed || '[]');
    //   this.cardsSubject.next(cards); // Imposta le carte nel BehaviorSubject
    //   this.isCardsLoaded = true;
    // } else {
    // Altrimenti carica le carte dal server
    this.getCards().subscribe((cards) => {
      this.cardsSubject.next(cards); // Imposta le carte nel BehaviorSubject
      // Salva le carte nel localStorage (compresse)
      // const compressed = LZString.compress(JSON.stringify(cards));
      // localStorage.setItem('cards', compressed);
      this.isCardsLoaded = true;
    });
    // }
  }
  // Funzione per ottenere le carte come Observable (per la reattività)
  getCardsFromSubject(): Observable<Card[]> {
    return this.cardsSubject.asObservable(); // Restituisci l'Observable per iscriversi
  }
  loadDeck() {
    const savedDeck = localStorage.getItem('userDeck');
    if (savedDeck) {
      return JSON.parse(savedDeck);
    } else {
      return [];
    }
  }
  refresh() {
    const savedCards = localStorage.removeItem('cards');
  }
  getCorniciList() {
    return [
      { id: 1, lable: 'Ghiaccio', img: 'ghiaccio.png' },
      { id: 2, lable: 'acqua', img: 'acqua.png' },
      { id: 1, lable: 'foresta', img: 'foresta.png' },
      { id: 1, lable: 'fuoco', img: 'fuoco.png' },
      { id: 1, lable: 'luce', img: 'luce.png' },
      { id: 1, lable: 'magia', img: 'magia.png' },
      { id: 1, lable: 'palude', img: 'ragno.png' },
      { id: 1, lable: 'roccia', img: 'roccia.png' },
      { id: 1, lable: 'teck', img: 'teck.png' },
      { id: 1, lable: 'vento', img: 'vento.png' },
    ];
  }
}
