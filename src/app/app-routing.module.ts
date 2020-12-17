import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationScreenComponent } from './configuration-screen/configuration-screen.component';
import { BoardComponent } from './game/board/board.component';

const routes: Routes = [
  { path: '', component: ConfigurationScreenComponent },
  { path: 'game', component: BoardComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
