import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createCell } from '../../core/models/game';
import { CellComponent } from './cell.component';

describe('CellComponent', () => {
  let fixture: ComponentFixture<CellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CellComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CellComponent);
    fixture.componentRef.setInput(
      'cell',
      createCell(1, 0, 0, { top: true, bottom: false, left: true, right: false }),
    );
    fixture.detectChanges();
  });

  it('creates', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('applies wall classes from the cell input', () => {
    const el: HTMLElement = fixture.nativeElement.querySelector('.cell');
    expect(el.classList).toContain('wall-top');
    expect(el.classList).toContain('wall-left');
    expect(el.classList).not.toContain('wall-bottom');
  });

  it('applies the escape marker only when the cell is the escape cell', () => {
    let el: HTMLElement = fixture.nativeElement.querySelector('.cell');
    expect(el.classList).not.toContain('escape');

    fixture.componentRef.setInput('cell', { ...fixture.componentInstance.cell(), isEscape: true });
    fixture.detectChanges();

    el = fixture.nativeElement.querySelector('.cell');
    expect(el.classList).toContain('escape');
  });
});
