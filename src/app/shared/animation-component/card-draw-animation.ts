import { Component, Inject, Input } from '@angular/core';
import { CardComponent } from '../card-component/card.component';
import { Card } from '../model/game-model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AudioService, SoundEffect } from '../../../service/audio-service';

@Component({
  selector: 'app-card-draw-animation',
  template: `<div class="drawn-card">
    <div class="card-drawn-overlay singleCard">
      <app-card
        [card]="data.card"
        [frameTitle]="data.frame"
        [isVisibileText]="true"
      ></app-card>
    </div>
  </div> `,
  styleUrls: ['./card-draw-animation.scss'],
  standalone: true,
  imports: [CardComponent],
})
export class CardDrawAnimationComponent {
  constructor(
    private audioService: AudioService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CardDrawAnimationComponent>
  ) {}
  ngOnInit(): void {
    this.audioService.playNamed(SoundEffect.CardDraw);
    setTimeout(() => {
      this.dialogRef.close();
    }, 1800);
  }
}
