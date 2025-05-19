import { Injectable } from '@angular/core';

import { Card } from '../app/shared/model/game-model';
import { CardDrawAnimationComponent } from '../app/shared/animation-component/card-draw-animation';
import { MatDialog } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
export class AnimationOverlayService {
  constructor(private dialog: MatDialog) {}

  showCardDrawn(card: Card, frame) {
    this.dialog.open(CardDrawAnimationComponent, {
      data: { card: card, frame: frame },
      panelClass: 'card-zoom-dialog',
      backdropClass: 'card-zoom-backdrop',
    });
  }
}
