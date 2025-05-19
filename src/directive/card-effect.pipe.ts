import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'cardEffectClass',
  pure: true,
})
export class CardEffectClassPipe implements PipeTransform {
  transform(card: any): string {
    if (!card) return '';

    const legacyClasses: string[] = [];
    const fxClasses: string[] = [];

    // === Mappa effetti visivi ===
    if (card.divineShield) {
      legacyClasses.push('ability-divine-shield');
      fxClasses.push('fx-border-top-gold');
    }

    if (card.abilities?.includes('STEALTH')) {
      legacyClasses.push('ability-stealth');
      fxClasses.push('fx-stealth');
    }

    if (card.abilities?.includes('WALL')) {
      legacyClasses.push('ability-wall');
      fxClasses.push('fx-border-left-gray');
    }

    if (card.abilities?.includes('RUSH')) {
      legacyClasses.push('ability-rush');
      fxClasses.push('fx-border-right-red');
    }

    if (card.abilities?.includes('CHARGE')) {
      legacyClasses.push('ability-charge');
      fxClasses.push('fx-border-right-red');
    }

    // if (card.canAttack === true) {
    //   legacyClasses.push('ability-can-attack');
    //   fxClasses.push('fx-bottom-green-glow');
    // } else if (card.canAttack === false) {
    //   legacyClasses.push('ability-resting');
    //   fxClasses.push('fx-resting');
    // }

    // === Se c'è un solo effetto visivo, usa le classi legacy ===
    if (legacyClasses.length <= 1) {
      return legacyClasses.join(' ');
    }

    // === Se ci sono più effetti, usa solo le fx-combinate ===
    return fxClasses.join(' ');
  }
}

// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({ name: 'cardEffectClass' })
// export class CardEffectClassPipe implements PipeTransform {
//   private readonly abilityToClass: Record<string, string> = {
//     DIVINE_SHIELD: 'ability-divine-shield',
//     STEALTH: 'ability-stealth',
//     WALL: 'ability-wall',
//     LIFESTEAL: 'ability-lifesteal',
//     RUSH: 'ability-rush',
//     CHARGE: 'ability-charge',
//   };

//   private readonly effectToClass: Record<string, string> = {
//     DAMAGE: 'effect-damage',
//     HEAL: 'effect-heal',
//     KILL: 'effect-kill',
//     DRAW: 'effect-draw',
//     SUMMON: 'effect-summon',
//     BUFF: 'effect-buff',
//     DEBUFF: 'effect-debuff',
//     SHIELD: 'effect-shield',
//     STUN: 'effect-stun',
//     LIFESTEAL: 'effect-lifesteal',
//   };

//   transform(card: any): string[] {
//     const classes: string[] = [];

//     (card.abilities || []).forEach((a: string) => {
//       const cssClass = this.abilityToClass[a];
//       if (cssClass) classes.push(cssClass);
//     });

//     const type = card?.effect?.type;
//     if (type && this.effectToClass[type]) {
//       classes.push(this.effectToClass[type]);
//     }

//     return classes;
//   }
// }
