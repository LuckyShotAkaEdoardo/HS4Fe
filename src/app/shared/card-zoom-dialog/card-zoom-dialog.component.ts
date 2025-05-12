import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-card-zoom-dialog',
  templateUrl: './card-zoom-dialog.component.html',
  styleUrls: ['./card-zoom-dialog.component.scss'],
})
export class CardZoomDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CardZoomDialogComponent>
  ) {}

  close() {
    this.dialogRef.close();
  }
}
