import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { StorageService } from '../services/storage.service';
import { ConfigurationScreenComponent } from './configuration-screen.component';

describe('ConfigurationScreenComponent', () => {
  let fixture: ComponentFixture<ConfigurationScreenComponent>;
  let component: ConfigurationScreenComponent;
  let storageService: StorageService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfigurationScreenComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    storageService = TestBed.inject(StorageService);
    router = TestBed.inject(Router);
  });

  it('pre-fills the form from previously saved settings', () => {
    spyOn(storageService, 'getGameSettings').and.returnValue({
      cellsX: 6,
      cellsY: 7,
      pits: 2,
      arrows: 3,
    });

    fixture = TestBed.createComponent(ConfigurationScreenComponent);
    component = fixture.componentInstance;

    expect(component.settingsForm.getRawValue()).toEqual({
      cellsX: 6,
      cellsY: 7,
      pits: 2,
      arrows: 3,
    });
  });

  it('defaults to a square board when nothing was saved (spec.md Assumptions)', () => {
    spyOn(storageService, 'getGameSettings').and.returnValue(null);

    fixture = TestBed.createComponent(ConfigurationScreenComponent);
    component = fixture.componentInstance;

    const value = component.settingsForm.getRawValue();
    expect(value.cellsX).toBe(value.cellsY);
  });

  it('saves the settings and navigates to /game on submit', () => {
    spyOn(storageService, 'getGameSettings').and.returnValue(null);
    fixture = TestBed.createComponent(ConfigurationScreenComponent);
    component = fixture.componentInstance;

    spyOn(storageService, 'saveGameSettings');
    spyOn(router, 'navigate');

    component.settingsForm.setValue({ cellsX: 5, cellsY: 5, pits: 2, arrows: 1 });
    component.onSubmit();

    expect(storageService.saveGameSettings).toHaveBeenCalledWith({
      cellsX: 5,
      cellsY: 5,
      pits: 2,
      arrows: 1,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/game']);
  });

  it('does not submit an invalid form', () => {
    spyOn(storageService, 'getGameSettings').and.returnValue(null);
    fixture = TestBed.createComponent(ConfigurationScreenComponent);
    component = fixture.componentInstance;

    spyOn(storageService, 'saveGameSettings');
    component.settingsForm.controls.cellsX.setValue(null as unknown as number);

    component.onSubmit();

    expect(storageService.saveGameSettings).not.toHaveBeenCalled();
  });
});
