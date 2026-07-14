import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ToastService } from 'src/app/shared/modules/toast';
import { IFundsTransferFromData } from '../funds-transfer.model';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DecimalPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss'],
  imports: [
    ReactiveFormsModule,
    TranslatePipe,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    DecimalPipe,
    DatePipe,
  ],
})
export class ReviewComponent implements OnInit {
  notificationType: any[] | undefined;
  public form!: UntypedFormGroup;
  fingerprintAccepted = false;
  constructor(
    public formBuilder: UntypedFormBuilder,
    private toast: ToastService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ReviewComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IFundsTransferFromData,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      sms: [true],
      email: [false],
    });
  }

  close() {
    this.dialogRef.close({ stop: true });
  }

  onSubmit(form: UntypedFormGroup) {
    localStorage.setItem('review_details', JSON.stringify(this.data));
    this.dialogRef.close(form.value);
  }

  openVerifyBio() {
    this.onSubmit(this.form);
  }
}
