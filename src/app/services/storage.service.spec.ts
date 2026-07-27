import { TestBed } from '@angular/core/testing';

import { GameConfiguration } from '../core/models/configuration';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  it('returns null when nothing has been saved yet', () => {
    expect(service.getGameSettings()).toBeNull();
  });

  it('round-trips settings through localStorage', () => {
    const settings: GameConfiguration = { cellsX: 6, cellsY: 6, pits: 2, arrows: 3 };
    service.saveGameSettings(settings);
    expect(service.getGameSettings()).toEqual(settings);
  });

  it('falls back to an in-memory value when localStorage throws (spec.md Edge Cases)', () => {
    const settings: GameConfiguration = { cellsX: 5, cellsY: 5, pits: 1, arrows: 1 };
    spyOn(localStorage, 'setItem').and.throwError('storage disabled');
    spyOn(localStorage, 'getItem').and.throwError('storage disabled');

    expect(() => service.saveGameSettings(settings)).not.toThrow();
    expect(service.getGameSettings()).toEqual(settings);
  });
});
