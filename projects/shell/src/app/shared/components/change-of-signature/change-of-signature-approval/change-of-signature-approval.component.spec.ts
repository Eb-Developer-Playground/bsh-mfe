import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ChangeOfSignatureApprovalComponent } from './change-of-signature-approval.component';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ChangeOfSignatureApprovalComponent', () => {
  let component: ChangeOfSignatureApprovalComponent;
  let fixture: ComponentFixture<ChangeOfSignatureApprovalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ChangeOfSignatureApprovalComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        MatCardModule,
        MatDividerModule,
        MatFormFieldModule,
        MatSelectModule,
        MatInputModule,
        MatOptionModule,
        FlexLayoutModule,
        NoopAnimationsModule,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeOfSignatureApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with required validators', () => {
    expect(component.approvalForm).toBeTruthy();
    const { approvalStatus, commentSection } = component.approvalForm
      .controls as any;

    // Required validators
    approvalStatus.setValue(null);
    commentSection.setValue('');
    expect(approvalStatus.valid).toBe(false);
    expect(commentSection.valid).toBe(false);

    // Max length validator (100)
    commentSection.setValue('a'.repeat(101));
    expect(commentSection.valid).toBe(false);

    commentSection.setValue('a'.repeat(100));
    approvalStatus.setValue(1);
    expect(component.approvalForm.valid).toBe(true);
  });

  it('should emit validity and values on status change', done => {
    const spy = jest.fn();
    component.isApprovalFormValid.subscribe(spy);

    component.approvalForm.patchValue({
      approvalStatus: 1,
      commentSection: 'Looks good',
    });

    // statusChanges is async; flush change detection
    fixture.whenStable().then(() => {
      expect(spy).toHaveBeenCalled();
      const payload = spy.mock.calls.pop()?.[0];
      expect(payload?.valid).toBe(true);
      expect(payload?.values).toEqual({
        approvalStatus: 1,
        commentSection: 'Looks good',
      });
      done();
    });
  });
});
