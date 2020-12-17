import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GameConfiguration } from 'src/app/core/models/configuration';
import { Board, Cell } from 'src/app/core/models/game';
import { GameService } from 'src/app/services/game.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BoardComponent implements OnInit {
  gameSettings: GameConfiguration;
  board: Board;
  cells: Cell[][];

  constructor(
    private storageService: StorageService,
    private gameservice: GameService
  ) {}

  ngOnInit(): void {
    this.createBoardMatrix();
  }

  createBoardMatrix() {
    this.gameSettings = this.storageService.getGameSettings();
    console.log(this.gameservice.createEmptyBoard(this.gameSettings).cells);
  }
}
