import { TestBed } from '@angular/core/testing';

import { PathCreatorService } from './path-creator.service';

describe('PathCreatorService', () => {
  let service: PathCreatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PathCreatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
