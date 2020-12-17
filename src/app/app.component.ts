import { Component } from '@angular/core';
import { GameService } from './services/game.service';
import { StorageService } from './services/storage.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Hunt Wumpus';
  constructor(
    private gameService: GameService,
    private storage: StorageService
  ) {
    this.checkGameSettings();
  }

  checkGameSettings() {
    let gameSettings = this.storage.getGameSettings();
    if (!gameSettings) {
      gameSettings = this.gameService.getDefaultGameSettings();
      this.storage.saveGameSettings(gameSettings);
    }
  }
}
