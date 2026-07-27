import { TestBed } from '@angular/core/testing';

import { Perception } from '../core/models/game';
import { MessagesService } from './messages.service';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MessagesService);
  });

  it('has exactly one non-empty message for every perception type', () => {
    for (const perception of Object.values(Perception)) {
      const message = service.getMessage(perception);
      expect(message).withContext(`message for ${perception}`).toBeTruthy();
    }
  });

  it('has a distinct message for arrow-hit-wall vs. arrow-hit-Wumpus (legacy-baseline.md §7.2)', () => {
    expect(service.getMessage(Perception.ArrowHitWall)).not.toBe(service.getMessage(Perception.Grito));
  });

  it('has a distinct message for every perception (no accidental duplicates)', () => {
    const messages = Object.values(Perception).map((p) => service.getMessage(p));
    expect(new Set(messages).size).toBe(messages.length);
  });
});
