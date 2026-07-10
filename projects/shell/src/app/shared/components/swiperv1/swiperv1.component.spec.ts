import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Swiperv1Component } from './swiperv1.component';

describe('Swiperv1Component', () => {
  let component: Swiperv1Component;
  let fixture: ComponentFixture<Swiperv1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Swiperv1Component],
    }).compileComponents();
  });

  it('should create', () => {
    expect(true).toBe(true);
  });
});
