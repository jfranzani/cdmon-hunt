import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./configuration-screen/configuration-screen.component').then(
        (m) => m.ConfigurationScreenComponent,
      ),
  },
  {
    path: 'game',
    loadComponent: () => import('./game/board/board.component').then((m) => m.BoardComponent),
  },
];
