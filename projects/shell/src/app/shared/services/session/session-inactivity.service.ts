import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';

import { TimeoutDialog } from '../../dialogs';

@Injectable({ providedIn: 'root' })
export class SessionInactivityService {
  private dialogRef: MatDialogRef<TimeoutDialog> | undefined;

  constructor(private dialog: MatDialog) {}

  showCountdown(options: {
    isLoggedIn: boolean;
    currentBankId: string;
    currentUrl: string;
    logout: () => Observable<unknown>;
    onReloginRequired: (returnUrl: string, bankId: string) => void;
  }): void {
    if (this.dialogRef || !options.isLoggedIn) {
      return;
    }

    this.dialogRef = this.dialog.open(TimeoutDialog, {
      width: '25rem',
      disableClose: true,
      data: {},
    });

    this.dialogRef.afterClosed().subscribe((result: { logout?: boolean }) => {
      this.dialogRef = undefined;
      if (!result?.logout) {
        return;
      }

      options.logout().subscribe(() => {
        options.onReloginRequired(options.currentUrl, options.currentBankId);
      });
    });
  }
}
