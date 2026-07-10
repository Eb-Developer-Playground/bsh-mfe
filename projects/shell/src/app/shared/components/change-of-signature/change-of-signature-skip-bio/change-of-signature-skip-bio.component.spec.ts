import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeOfSignatureSkipBioComponent } from './change-of-signature-skip-bio.component';

class MatDialogRefStub {
  close = jest.fn();
}

describe('ChangeOfSignatureSkipBioComponent', () => {
  let component: ChangeOfSignatureSkipBioComponent;
  let fixture: ComponentFixture<ChangeOfSignatureSkipBioComponent>;
  let dialogRef: MatDialogRefStub;
  let router: Router;

  const data = {
    cif: '123',
    ticketId: 'T-1',
    stakeholderName: 'John Doe',
    nationalId: 'ID1',
    accountNo: 'A1',
    accountType: 'SAV',
    approvalRequired: true,
  };

  beforeEach(async () => {
    dialogRef = new MatDialogRefStub();

    await TestBed.configureTestingModule({
      declarations: [ChangeOfSignatureSkipBioComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
        MatDialogModule,
        MatFormFieldModule,
        MatSelectModule,
        MatOptionModule,
        MatButtonModule,
        MatIconModule,
        NoopAnimationsModule,
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeOfSignatureSkipBioComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require reason', () => {
    expect(component.reasonForm.valid).toBe(false);
    component.reasonForm.patchValue({ reason: 'Justification' });
    expect(component.reasonForm.valid).toBe(true);
  });

  it('onSubmit should navigate to success and close dialog', () => {
    const navSpy = jest.spyOn(router, 'navigate');
    const closeSpy = jest.spyOn(dialogRef, 'close');
    component.onSubmit();

    expect(navSpy).toHaveBeenCalledWith(
      ['/services/change-of-signature/success'],
      expect.any(Object)
    );
    expect(closeSpy).toHaveBeenCalled();
  });
});
