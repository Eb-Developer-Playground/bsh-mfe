import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MessageBoxType } from 'src/app/shared/modules/toast/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-biometric-complete',
  templateUrl: './biometric-complete.component.html',
  styleUrls: ['./biometric-complete.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class BiometricCompleteDialog implements OnInit {
  success = MessageBoxType.SUCCESS;
  title = 'Biometrics scanned successfully';
  text =
    'The customer’s biometric information was scanned and saved successfully';

  constructor(
    public dialogRef: MatDialogRef<BiometricCompleteDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }
}
