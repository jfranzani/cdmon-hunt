import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
    private gameservice: GameService,
    private route: Router
  ) {}

  ngOnInit(): void {
    this.createBoardMatrix();
  }

  createBoardMatrix() {
    let cells: Cell[][];
    this.gameSettings = this.storageService.getGameSettings();
    this.board = this.gameservice.createEmptyBoard(this.gameSettings);
    cells = this.board.cells;
    this.gameservice.addEscapeCell(cells);
    this.gameservice.addGold(cells);
    this.gameservice.addWumpus(cells);
    this.gameservice.createCleanPathToGold(cells);
    this.gameservice.addPits(cells, this.gameSettings.pits);
    console.log(cells);
  }

  resetBoard() {
    this.createBoardMatrix();
  }

  goBack() {
    this.route.navigate(['']);
  }
}
