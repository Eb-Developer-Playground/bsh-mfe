import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ReactiveFormsModule,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { PhotoSignatoriesListComponent } from './signatories-list.component';
interface Mandate {
  signatoryName: string;
  signatoryId: string;
  mandate: string;
}

describe('PhotoSignatoriesListComponent', () => {
  let component: PhotoSignatoriesListComponent;
  let fixture: ComponentFixture<PhotoSignatoriesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PhotoSignatoriesListComponent, ReactiveFormsModule], schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA], }).compileComponents();

    fixture = TestBed.createComponent(PhotoSignatoriesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should accept mandate form and signatories inputs', () => {
    component.mandateForm = new UntypedFormGroup({
      signatory: new UntypedFormControl(''),
    });
    const list: Mandate[] = [
      { signatoryName: 'John', signatoryId: '1', mandate: 'SELF' } as any,
    ];

    component.signatories = list as any;
    fixture.detectChanges();

    expect(component.mandateForm.value).toEqual({ signatory: '' });
    expect(component.signatories.length).toBe(1);
  });
});
