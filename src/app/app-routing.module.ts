import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ConfigurationScreenComponent } from './configuration-screen/configuration-screen.component';

const routes: Routes = [{ path: '', component: ConfigurationScreenComponent }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
