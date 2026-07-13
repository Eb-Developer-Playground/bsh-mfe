import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-timeout-dialog',
  template: `
    <h2 mat-dialog-title>{{ 'DIALOG.YOUVE-BEEN-INACTIVE' | translate }}</h2>
    <mat-dialog-content>
      <p>
        {{ 'DIALOG.YOU-WILL-BE-LOCKED-OUT-IN' | translate }}
        <b>{{ timeToLogout }}s</b>
      </p>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button (click)="stayLoggedIn()">{{ 'DIALOG.STAY' | translate }}</button>
      <button mat-button (click)="logoutNow()">{{ 'COMMON.LOG-OUT' | translate }}</button>
    </mat-dialog-actions>
  `,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, TranslatePipe],
})
export class TimeoutDialog implements OnInit, OnDestroy {
  logoutIn = 60;
  logoutTimer: ReturnType<typeof setInterval> | undefined;
  timeToLogout: number | null = null;

  dialogRef = inject(MatDialogRef<TimeoutDialog>);
  data = inject(MAT_DIALOG_DATA);

  ngOnInit(): void {
    this.countDownLogout();
  }

  ngOnDestroy() {
    clearInterval(this.logoutTimer);
  }

  countDownLogout = () => {
    if (!this.timeToLogout) {
      this.timeToLogout = this.logoutIn;
    }
    this.logoutTimer = setInterval(() => {
      this.timeToLogout!--;
      if (this.timeToLogout === 0) {
        this.logoutNow();
      }
    }, 1000);
  };

  stayLoggedIn = () => {
    // stay logged in
    this.dialogRef.close({ stay: true });
  };

  logoutNow(): void {
    // stop all timer and end the session
    this.closeDialog();
  }

  closeDialog = () => this.dialogRef.close({ logout: true });
}
