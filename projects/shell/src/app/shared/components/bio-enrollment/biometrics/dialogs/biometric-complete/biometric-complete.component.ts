import { Component, Inject, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MessageBoxType } from 'src/app/shared/modules/toast/models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../../../compat-barrel';

@Component({
  selector: 'app-biometric-complete',
  templateUrl: './biometric-complete.component.html',
  styleUrls: ['./biometric-complete.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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
