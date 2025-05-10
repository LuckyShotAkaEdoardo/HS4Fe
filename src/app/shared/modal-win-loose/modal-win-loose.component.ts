import { Component, Input } from '@angular/core';
import { GameModuleModule } from '../../game-module/game-module.module';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-win-loose',
  imports: [GameModuleModule],
  templateUrl: './modal-win-loose.component.html',
  styleUrl: './modal-win-loose.component.scss',
})
export class ModalWinLooseComponent {
  @Input() isWin;

  win = 'assets/card-img/victory.png';
  loser = 'assets/card-img/defeat.png';
  constructor(private router: Router) {}
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
