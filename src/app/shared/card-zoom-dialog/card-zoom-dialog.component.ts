import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-card-zoom-dialog',
  templateUrl: './card-zoom-dialog.component.html',
  styleUrls: ['./card-zoom-dialog.component.scss'],
})
export class CardZoomDialogComponent implements OnInit {
  contentSrc;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<CardZoomDialogComponent>
  ) {}
  ngOnInit(): void {
    this.contentSrc = environment.allcard + this.data.image;
  }

  close() {
    this.dialogRef.close();
  }
}
