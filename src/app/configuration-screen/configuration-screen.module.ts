import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfigurationScreenComponent } from './configuration-screen.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ConfigurationScreenComponent],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class ConfigurationScreenModule {}
