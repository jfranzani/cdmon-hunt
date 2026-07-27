import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { getDefaultGameConfiguration, GameConfiguration } from '../core/models/configuration';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-configuration-screen',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './configuration-screen.component.html',
  styleUrl: './configuration-screen.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfigurationScreenComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly storage = inject(StorageService);

  readonly settingsForm = this.buildForm();

  private buildForm() {
    const settings = this.storage.getGameSettings() ?? getDefaultGameConfiguration();
    return this.fb.nonNullable.group({
      cellsX: [settings.cellsX, [Validators.required]],
      cellsY: [settings.cellsY, [Validators.required]],
      pits: [settings.pits, [Validators.required]],
      arrows: [settings.arrows, [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.settingsForm.invalid) {
      return;
    }
    const raw = this.settingsForm.getRawValue();
    const config: GameConfiguration = {
      cellsX: Number(raw.cellsX),
      cellsY: Number(raw.cellsY),
      pits: Number(raw.pits),
      arrows: Number(raw.arrows),
    };
    this.storage.saveGameSettings(config);
    this.router.navigate(['/game']);
  }
}
