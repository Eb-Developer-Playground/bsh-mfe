import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-soft-delete-dialog',
  templateUrl: './soft-delete-dialog.component.html',
  styleUrls: ['./soft-delete-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class SoftDeleteDialogComponent {
  constructor(
    private router: Router,
    public dialogRef: MatDialogRef<SoftDeleteDialogComponent>
  ) {}

  goToSoftDelete() {
    this.router.navigateByUrl('/services/omnichannel-profile');
    this.dialogRef.close();
  }
}
