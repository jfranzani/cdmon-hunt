import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ConfigurationScreenModule } from './configuration-screen/configuration-screen.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ConfigurationScreenModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
