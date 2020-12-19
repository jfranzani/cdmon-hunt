import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SeedService {
  constructor() {}

  getEscapeRandomNumber(colsAmount: number, rowsAmount: number): number {
    let totalRows = (colsAmount - 1) * 2 + (rowsAmount - 1) * 2 - 4;
    return Math.floor(Math.random() * totalRows);
  }
}
