export type CardType = 'HERO' | 'MAGIC';

export interface Card {
  id: string;
  name: string;
  cost: number;
  attack: number;
  defense: number;
  effect: string;
  image: string;
  type: CardType;
  justPlayed?: boolean;
}
export interface GameState {
  hands: Record<string, number>; // username → numero carte
  health: Record<string, number>; // username → HP
  crystals: Record<string, number>; // username → cristalli disponibili
  maxCrystals: Record<string, number>; // username → cristalli massimi
  boards: Record<string, Card[]>; // username → board con carte giocate
  allPlayers: string[]; // ["utente1", "utente2"]
  players: string[];
  opponentId: string;
  username: string;
  turn: string; // username del giocatore di turno
  winner?: string; // se presente → username vincitore
  currentTurnIndex;
}
