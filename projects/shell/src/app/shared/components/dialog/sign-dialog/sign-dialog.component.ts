import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

export interface signDialogData {
  canVerify: string;
}
interface Provider {
  authtitle: string;
  authsubtitle: string;
}
@Component({
  selector: 'app-sign-dialog',
  templateUrl: './sign-dialog.component.html',
  styleUrls: ['./sign-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class SignDialogComponent implements OnInit {
  forms: any;

  options: Array<Provider> = [
    {
      authtitle: 'Authorized account signatories are present',
      authsubtitle:
        'Required account signatories must present and bio-verify as per the mandate. If they are not, select skip biometric verification below.',
    },
    {
      authtitle: 'Skip biometric verification',
      authsubtitle:
        'Submit a bio-override request in the case where required signatories are not present or taking stakeholder biometrics is not possible.',
    },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: signDialogData
  ) {
    this.forms = new UntypedFormGroup({
      authoptions: new UntypedFormControl(),
    });
    for (let index = 0; index < this.options.length; index++) {
      const element = this.options[index];
    }
  }

  ngOnInit(): void {
    this.init();
  }

  init = () => {
    this.forms = this.fb.group({
      authoptions: ['', Validators.required],
    });
  };

  onNoClick(): void {
    this.dialogRef.close();
  }

  setCanVerify(event: any): void {
    this.data.canVerify = event.value;
  }

  continue() {
    if (this.data.canVerify === '') return;
    this.dialogRef.close(this.data.canVerify);
  }
}
