import { Component, OnInit, Inject } from '@angular/core';

import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-payment',
  templateUrl: './confirm-payment.component.html',
  styleUrls: ['./confirm-payment.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class ConfirmPaymentComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ConfirmPaymentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {}

  closeDialog(value: boolean): void {
    this.dialogRef.close(value);
  }

  submit(value: boolean) {
    this.dialogRef.close(value);
  }
}
