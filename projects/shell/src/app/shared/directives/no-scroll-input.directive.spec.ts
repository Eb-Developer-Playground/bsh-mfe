import { NoScrollInputDirective } from './no-scroll-input.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';
import { COMPAT_IMPORTS } from '../compat-barrel';
@Component({
  template: `<input type="number" appNoScrollInput />`,
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
class TestComponent {}

describe('NoScrollInputDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NoScrollInputDirective, TestComponent],
    });

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should prevent default scrolling behavior on wheel event', () => {
    const inputElement = fixture.debugElement.query(
      By.css('input')
    ).nativeElement;
    const wheelEvent = new WheelEvent('wheel');

    // Spy on the preventDefault method
    const preventDefaultSpy = jest.spyOn(wheelEvent, 'preventDefault');
    // Dispatch the wheel event
    inputElement.dispatchEvent(wheelEvent);

    // Check that preventDefault was called
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
  it('should create an instance', () => {
    const directive = new NoScrollInputDirective();
    expect(directive).toBeTruthy();
  });
});
