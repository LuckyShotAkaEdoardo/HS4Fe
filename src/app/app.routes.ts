import { Routes } from '@angular/router';

import { DashboardComponent } from './dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';

import { RegisterComponent } from './auth/register/register.component';
import { GameBoardComponent } from './game-board/game-board.component';
import { authGuard } from '../guard/auth.guard';
import { DeckBuilderComponent } from './deck-builder/deck-builder.component';
import { UserComponent } from './auth/user/user.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }, // <-- registrazione
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'game',
    component: GameBoardComponent,
    canActivate: [authGuard],
  }, // Plancia di gioco
  {
    path: 'deck-build',
    component: DeckBuilderComponent,
    canActivate: [authGuard],
  },
  {
    path: 'profile',
    component: UserComponent,
    canActivate: [authGuard],
  },
];
