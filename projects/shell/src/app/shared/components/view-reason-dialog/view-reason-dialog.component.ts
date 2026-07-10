import { Component, Inject, OnInit, Output, EventEmitter, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { AuditService } from 'src/app/core/services/audit/audit.service';
import { WhiteSpaceValidator } from '../../directives/whitespace-validator';

export interface ViewReasonData {
  viewReason: string;
}

@Component({
  selector: 'app-view-reason-dialog',
  templateUrl: './view-reason-dialog.component.html',
  styleUrls: ['./view-reason-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ViewReasonDialogComponent implements OnInit {
  @Output() confirmAction: EventEmitter<any> = new EventEmitter<any>();
  @Output() cancelAction: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    public dialogRef: MatDialogRef<ViewReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewReasonData,
    private auditService: AuditService
  ) {}

  public form!: UntypedFormGroup;
  private fb = inject(UntypedFormBuilder);

  ngOnInit(): void {
    this.form = this.fb.group({
      reason: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(300),
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      ],
    });
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  next() {
    // if (this.data.viewReason === '') return;
    this.dialogRef.close({ data: this.data.viewReason });
    const { reason } = this.form.value;
    const log = {
      EventName: 'ViewCustomerProfile',
      EventDescription: 'View Customer Profile',
      AuditData: JSON.stringify({ reason }),
    };
    this.auditService['auditLog'](log, true).subscribe(
      (res: any) => {
        this.confirmAction.emit(res);
      },
      (err: any) => {
        this.confirmAction.emit(err);
      }
    );
  }
}
