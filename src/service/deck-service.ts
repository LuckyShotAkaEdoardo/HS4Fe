import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface Deck {
  isSelected: boolean;
  frame: string;
  name: string;
  cards: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DeckService {
  private baseUrl = environment.apiUrlDeck; // 🔁 modifica se hai host diverso

  constructor(private http: HttpClient) {}

  /** GET /decks/init/:username */
  initDecks(username: string): Observable<{ id: number; decks: Deck[] }> {
    return this.http.get<{ id: number; decks: Deck[] }>(
      `${this.baseUrl}/init/${username}`
    );
  }

  /** GET /decks/selected/:username */
  getSelectedDeck(username: string): Observable<Deck> {
    return this.http.get<Deck>(`${this.baseUrl}/selected/${username}`);
  }

  /** PUT /decks/:username */
  updateDecks(username: string, decks: Deck[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/${username}`, { decks });
  }

  /** DELETE /decks/:username */
  deleteDecks(username: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${username}`);
  }
}
