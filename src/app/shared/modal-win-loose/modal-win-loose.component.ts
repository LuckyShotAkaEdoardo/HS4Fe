import { Component, Input } from '@angular/core';
import { GameModuleModule } from '../../game-module/game-module.module';
import { Router } from '@angular/router';
import { DoubleTapDirective } from '../../../directive/long-press.directive';

@Component({
  selector: 'app-modal-win-loose',
  imports: [GameModuleModule, DoubleTapDirective],
  templateUrl: './modal-win-loose.component.html',
  styleUrl: './modal-win-loose.component.scss',
})
export class ModalWinLooseComponent {
  @Input() isWin;

  win = 'assets/card-img/victory.png';
  loser = 'assets/card-img/defeat.png';
  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras.state as {
      result: 'win' | 'lose';
      message: string;
    };
    this.isWin = state?.result == 'win' ? true : false;
  }
  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
