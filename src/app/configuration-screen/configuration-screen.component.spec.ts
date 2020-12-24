import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StorageService } from '../services/storage.service';

import { ConfigurationScreenComponent } from './configuration-screen.component';

describe('ConfigurationScreenComponent', () => {
  let component: ConfigurationScreenComponent;
  let fixture: ComponentFixture<ConfigurationScreenComponent>;
  let storageService: StorageService;
  let route: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigurationScreenComponent],
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create the reactive form with correct values', () => {
    // Arrange
    storageService = TestBed.inject(StorageService);
    route = TestBed.inject(Router);
    spyOn(storageService, 'getGameSettings').and.returnValue({
      cellsX: 8,
      cellsY: 8,
      pits: 1,
      arrows: 1,
    });
    // Action
    component.createReactiveForm();
    // Assert
    expect(component.settingsForm.controls['colsX'].value).toEqual(8);
    expect(component.settingsForm.controls['colsY'].value).toEqual(8);
    expect(component.settingsForm.controls['pits'].value).toEqual(1);
    expect(component.settingsForm.controls['arrows'].value).toEqual(1);
  });

  it('should submit with correct values, call saveGameSetting and navigate', () => {
    // Arrange
    storageService = TestBed.inject(StorageService);
    route = TestBed.inject(Router);
    spyOn(storageService, 'saveGameSettings');
    spyOn(route, 'navigate');
    component.settingsForm.controls['colsX'].setValue('1');
    component.settingsForm.controls['colsY'].setValue('2');
    component.settingsForm.controls['pits'].setValue('3');
    component.settingsForm.controls['arrows'].setValue('4');
    // Action
    component.onSubmit();
    // Assert
    expect(storageService.saveGameSettings).toHaveBeenCalledWith({
      cellsX: 1,
      cellsY: 2,
      pits: 3,
      arrows: 4,
    });

    expect(route.navigate).toHaveBeenCalledWith(['/game']);
  });
});
