import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { ChangeOfSignatureBioDialog } from './change-of-signature-bio-dialog.component';
import { ChangeOfSignatureSkipBioComponent } from '../change-of-signature-skip-bio/change-of-signature-skip-bio.component';
import { ChangeOfSignatureService } from '../../../../core/services/change-of-signature/change-of-signature.service';
import { TranslateModule } from '@ngx-translate/core';

class MatDialogRefStub {
  close = jest.fn();
}

class MatDialogStub {
  afterClosedResult: any = true;
  open() {
    return { afterClosed: () => of(this.afterClosedResult) } as any;
  }
}

describe('ChangeOfSignatureBioDialog', () => {
  let component: ChangeOfSignatureBioDialog;
  let fixture: ComponentFixture<ChangeOfSignatureBioDialog>;
  let dialogRef: MatDialogRefStub;
  let dialog: MatDialogStub;
  let router: Router;

  const data = {
    cif: '123',
    ticketId: 'T-1',
    stakeholderName: 'John Doe',
    nationalId: 'ID1',
    accountNo: 'A1',
    accountType: 'SAV',
  };

  beforeEach(async () => {
    dialogRef = new MatDialogRefStub();
    dialog = new MatDialogStub();

    await TestBed.configureTestingModule({
      imports: [
        ChangeOfSignatureBioDialog,
        ReactiveFormsModule,
        MatDialogModule,
        RouterTestingModule.withRoutes([]),
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatDialog, useValue: dialog },
        {
          provide: ChangeOfSignatureService,
          useValue: { bioVerify: jest.fn() },
        },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeOfSignatureBioDialog);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute stakeholder initials from name', () => {
    expect(component.stakeholderInitials).toBe('JD');
  });

  it('should close and open skip-bio dialog with approvalRequired true', () => {
    const closeSpy = jest.spyOn(dialogRef, 'close');
    const openSpy = jest.spyOn(dialog as any, 'open');

    component.reasonBioSkip();

    expect(closeSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith(
      ChangeOfSignatureSkipBioComponent,
      expect.objectContaining({
        width: '580px',
        data: expect.objectContaining({ approvalRequired: true }),
        disableClose: true,
      })
    );
  });

  it('navigateSuccess should navigate to success with state', async () => {
    const navSpy = jest.spyOn(router, 'navigate');
    component.navigateSuccess();
    expect(navSpy).toHaveBeenCalledWith(
      ['/services/change-of-signature/success'],
      expect.any(Object)
    );
  });
});
