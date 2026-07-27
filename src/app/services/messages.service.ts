import { Injectable } from '@angular/core';

import { Perception } from '../core/models/game';

/**
 * Exactly one message per `Perception`. Because `MESSAGES` is a single `Record<Perception, string>`
 * object literal, the TypeScript compiler itself rejects a duplicate key — the class of bug behind
 * the legacy `MessagesService`'s duplicate `arrowHitWall`/`arrowHitWumpus` registrations
 * (legacy-baseline.md §7.2) is now impossible to reintroduce, not just avoided by convention
 * (FR-006, Constitution Principle VII).
 */
const MESSAGES: Readonly<Record<Perception, string>> = {
  [Perception.Stench]: 'Sientes un hedor muy intenso',
  [Perception.Breeze]: 'Sientes una leve brisa',
  [Perception.Glimmer]: 'Has encontrado el oro! Vuelve a la salida para escapar',
  [Perception.Choque]: 'No puedes avanzar, chocas contra una pared',
  [Perception.Grito]: 'Escuchas el grito de dolor del Wumpus',
  [Perception.ArrowHitWall]: 'Escuchas el ruido de la flecha golpear la pared',
  [Perception.PitDeath]: 'Has caído en el pozo',
  [Perception.WumpusDeath]: 'Ves al Wumpus cara a cara y recibes un golpe con su garrote',
  [Perception.EmptyCell]: 'No hay nada por aquí...',
  [Perception.NoArrows]: 'Buscas en tu mochila pero no encuentras más flechas',
  [Perception.Won]: 'Felicitaciones! Has escapado con el oro!',
  [Perception.ExitedWithoutGold]: 'Sales de la mazmorra con las manos vacías',
  [Perception.Start]: 'Entras a la mazmorra...',
};

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  getMessage(perception: Perception): string {
    return MESSAGES[perception];
  }
}
