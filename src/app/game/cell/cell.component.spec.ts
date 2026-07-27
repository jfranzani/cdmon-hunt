import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Direction, createCell } from '../../core/models/game';
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

  it('renders the hunter marker only when the cell holds the hunter', () => {
    expect(fixture.nativeElement.querySelector('.hunter')).toBeNull();

    fixture.componentRef.setInput(
      'cell',
      { ...fixture.componentInstance.cell(), hasPlayer: true },
    );
    fixture.componentRef.setInput('hunterFacing', Direction.East);
    fixture.detectChanges();

    const hunterEl: HTMLElement = fixture.nativeElement.querySelector('.hunter');
    expect(hunterEl).toBeTruthy();
    expect(hunterEl.classList).toContain('facing-east');
  });
});
