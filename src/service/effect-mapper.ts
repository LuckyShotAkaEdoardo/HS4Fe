// card-effect-class.util.ts

export type EffectOrAbility =
  | 'DAMAGE'
  | 'HEAL'
  | 'KILL'
  | 'DRAW'
  | 'SUMMON'
  | 'BUFF'
  | 'DEBUFF'
  | 'SHIELD'
  | 'STUN'
  | 'LIFESTEAL'
  | 'DIVINE_SHIELD'
  | 'STEALTH'
  | 'WALL'
  | 'RUSH'
  | 'CHARGE';

const effectTypeToClass: Record<string, string> = {
  DAMAGE: 'effect-damage',
  HEAL: 'effect-heal',
  KILL: 'effect-kill',
  DRAW: 'effect-draw',
  SUMMON: 'effect-summon',
  BUFF: 'effect-buff',
  DEBUFF: 'effect-debuff',
  SHIELD: 'effect-shield',
  STUN: 'effect-stun',
  LIFESTEAL: 'effect-lifesteal',
};

const abilityToClass: Record<string, string> = {
  DIVINE_SHIELD: 'ability-divine-shield',
  STEALTH: 'ability-stealth',
  WALL: 'ability-wall',
  LIFESTEAL: 'ability-lifesteal',
  RUSH: 'ability-rush',
  CHARGE: 'ability-charge',
};

export function getCardVisualClasses(card: {
  effect?: { type?: string };
  abilities?: string[];
}): string[] {
  const classes: string[] = [];

  if (card.effect?.type && effectTypeToClass[card.effect.type]) {
    classes.push(effectTypeToClass[card.effect.type]);
  }

  (card.abilities || []).forEach((ability) => {
    const cls = abilityToClass[ability];
    if (cls) classes.push(cls);
  });

  return classes;
}
export type VisualEventType =
  | 'DAMAGE'
  | 'HEAL'
  | 'KILL'
  | 'DRAW'
  | 'SUMMON'
  | 'LIFESTEAL'
  | 'BUFF'
  | 'DEBUFF'
  | 'SHIELD'
  | 'STUN';

export interface VisualEvent {
  type: VisualEventType;

  // ID della carta coinvolta (se presente)
  cardId?: string;

  // Giocatore sorgente dell’effetto
  source?: string;

  // Proprietario (per filtrarli lato FE se necessario)
  owner?: string;

  // Dati opzionali
  amount?: number;
  target?: string;
  extra?: any;
}

// USO in Angular (HTML)
// <div [ngClass]="getCardVisualClasses(card)">...</div>

// USO in Angular (TS Component)
// import { getCardVisualClasses } from './card-effect-class.util';
