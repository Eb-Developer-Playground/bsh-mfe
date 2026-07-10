import { CommonModule } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, CommonModule],
    })
      .overrideComponent(HeaderComponent, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept fullName input and compute initials on init', () => {
    component.fullName = 'Musa Test';
    fixture.detectChanges();

    component.ngOnInit();

    expect(component.fullName).toBe('Musa Test');
    expect(component.initials).toBe('MT');
  });

  it('should compute initials correctly when fullName has multiple words', () => {
    component.fullName = 'Musa Musa Test';
    fixture.detectChanges();

    component.ngOnInit();

    expect(component.initials).toBe('MMT');
  });

  it('should set initials to empty string if fullName is empty', () => {
    component.fullName = '';
    fixture.detectChanges();

    component.setInitials();

    expect(component.initials).toBe('');
  });

  it('should trim spaces and compute initials correctly', () => {
    component.fullName = '   Musa    Test   ';
    fixture.detectChanges();

    component.setInitials();

    expect(component.initials).toBe('MT');
  });
});
