import { Routes } from '@angular/router';

import { GameTestComponent } from './game-test.component';

export const gameTestRoutes: Routes = [
  {
    path: 'test/:gameId',
    component: GameTestComponent
  }
];
