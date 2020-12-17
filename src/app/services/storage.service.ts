import { Injectable } from '@angular/core';
import { GameConfiguration } from '../core/models/configuration';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  saveGameSettings(gameSettings: GameConfiguration): void {
    localStorage.setItem('game-settings', JSON.stringify(gameSettings));
  }
  getGameSettings(): GameConfiguration {
    return JSON.parse(localStorage.getItem('game-settings'));
  }
}
