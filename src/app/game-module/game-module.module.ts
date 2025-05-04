import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../material.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule, FormsModule, MaterialModule],
  exports: [CommonModule, RouterModule, FormsModule, MaterialModule],
})
export class GameModuleModule {}
