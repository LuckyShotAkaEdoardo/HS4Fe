export type CardType = 'HERO' | 'MAGIC';

export interface Card {
  _id: string;
  id: string;
  name: string;
  attack: number;
  defense: number;
  cost: number;
  image: string;
  type: 'HERO' | 'MAGIC';
  abilities?: string[];
  description?: string;
  justPlayed?: boolean;
  canAttack;
  effect?: {
    type: string; // es. "DAMAGE", "HEAL"
    trigger?: string; // es. "ON_PLAY", "ON_TURN_START"
    value?: number | { attack?: number; defense?: number }; // es. 3 o { attack: 4, defense: 2 }
    target?: string | string[] | { condition: string }; // es. "SELF", ["a", "b"], { condition: "HP_LT_5" }
    count?: number; // es. 2 → massimo N bersagli
    mode?: string; // es. "available" | "max" (per CRYSTALS)
    duration?: number; // es. 2 turni per STUN, BURN, ecc.
    subtype?: string; // es. "HERO" (per SUMMON, TRANSFORM)
    intoCardId?: string; // es. "pecora_trasformata"
  };
}
export interface GameState {
  userIds: any;
  turnInfo: any;
  hands: Record<string, number>; // username → numero carte
  health: Record<string, number>; // username → HP
  crystals: Record<string, number>; // username → cristalli disponibili
  maxCrystals: Record<string, number>; // username → cristalli massimi
  boards: Record<string, Card[]>; // username → board con carte giocate
  allPlayers: string[]; // ["utente1", "utente2"]
  players: string[];
  opponentId: string;
  username: string;
  barrier: any[];
  turn: string; // username del giocatore di turno
  winner?: string; // se presente → username vincitore
  currentTurnIndex;
}
