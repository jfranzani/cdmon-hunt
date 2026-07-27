import { Injectable } from '@angular/core';

import { GameConfiguration } from '../core/models/configuration';

const STORAGE_KEY = 'game-settings';

/**
 * Wraps `localStorage`, falling back to an in-memory value when it's unavailable (private
 * browsing, storage disabled, etc.) so the configuration screen never crashes — spec.md Edge Cases.
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private inMemoryFallback: GameConfiguration | null = null;

  saveGameSettings(gameSettings: GameConfiguration): void {
    this.inMemoryFallback = gameSettings;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gameSettings));
    } catch {
      // localStorage unavailable — the in-memory fallback above still holds the value.
    }
  }

  getGameSettings(): GameConfiguration | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as GameConfiguration) : this.inMemoryFallback;
    } catch {
      return this.inMemoryFallback;
    }
  }
}
