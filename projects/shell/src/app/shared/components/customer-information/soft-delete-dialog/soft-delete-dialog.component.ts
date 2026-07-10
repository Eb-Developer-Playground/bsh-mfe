import { Component } from '@angular/core';

import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-soft-delete-dialog',
  templateUrl: './soft-delete-dialog.component.html',
  styleUrls: ['./soft-delete-dialog.component.scss'],
})
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
