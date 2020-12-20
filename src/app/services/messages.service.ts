import { Injectable } from '@angular/core';
import { ConsoleMessages } from '../core/models/game';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  private availableMessages = new Map();

  constructor() {
    this.createMessages();
  }

  getMessage(event: ConsoleMessages) {
    return this.availableMessages.get(event);
  }

  createMessages() {
    this.availableMessages.set(
      ConsoleMessages.arrowFired,
      'Has disparado una flecha'
    );
    this.availableMessages.set(
      ConsoleMessages.arrowHitWall,
      'Oyes el ruido de la flecha chocar contra una pared'
    );
    this.availableMessages.set(
      ConsoleMessages.arrowHitWumpus,
      'La flecha disparada alcanzó al Wumpus'
    );
    this.availableMessages.set(
      ConsoleMessages.goldenFound,
      'Has encontrado el oro! Escapa!'
    );
    this.availableMessages.set(
      ConsoleMessages.noMoreArrows,
      'Ya no dispones de flechas'
    );
    this.availableMessages.set(
      ConsoleMessages.pitBreeze,
      'Sientes una leve brisa'
    );
    this.availableMessages.set(ConsoleMessages.pitDead, 'Has caído en el pozo');
    this.availableMessages.set(ConsoleMessages.playerDead, 'Has muerto');
    this.availableMessages.set(
      ConsoleMessages.wallAhead,
      'No puedes avanzar, pared adelante'
    );
    this.availableMessages.set(
      ConsoleMessages.wumpusDead,
      'El Wumpus ha muerto!'
    );
    this.availableMessages.set(
      ConsoleMessages.wumpusScream,
      'Oyes el grito del Wumpus'
    );
    this.availableMessages.set(
      ConsoleMessages.wumpusStink,
      'Sientes un hedor muy intenso'
    );
    this.availableMessages.set(
      ConsoleMessages.wumpusWon,
      'Ves al Wumpus cara a cara y recibes un golpe con su garrote'
    );
    this.availableMessages.set(
      ConsoleMessages.emptyCell,
      'No hay nada por aquí...'
    );
  }
}
