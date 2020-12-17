import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { GameConfiguration } from '../core/models/configuration';
import { StorageService } from '../services/storage.service';

@Component({
  selector: 'app-configuration-screen',
  templateUrl: './configuration-screen.component.html',
  styleUrls: ['./configuration-screen.component.scss'],
})
export class ConfigurationScreenComponent implements OnInit {
  settingsForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storageService: StorageService
  ) {
    this.creatReactiveForm();
  }

  creatReactiveForm() {
    const gameSettings = this.storageService.getGameSettings();
    this.settingsForm = this.fb.group({
      colsX: [gameSettings?.cellsX || 8],
      colsY: [gameSettings?.cellsY || 8],
      pits: [gameSettings?.pits || 1],
      arrows: [gameSettings?.arrows || 1],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    const settings: GameConfiguration = {
      cellsX: +this.settingsForm.get('colsX').value,
      cellsY: +this.settingsForm.get('colsY').value,
      pits: +this.settingsForm.get('pits').value,
      arrows: +this.settingsForm.get('arrows').value,
    };
    this.storageService.saveGameSettings(settings);
    this.router.navigate(['/game']);
  }
}
