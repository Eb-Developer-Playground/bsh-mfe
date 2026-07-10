import { Component, Inject, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-timeout-dialog',
  templateUrl: './timeout.dialog.html',
  styleUrls: ['./timeout.dialog.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class TimeoutDialog implements OnInit, OnDestroy {
  logoutIn = 60;
  logoutTimer: any;
  timeToLogout: any;

  constructor(
    public dialogRef: MatDialogRef<TimeoutDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

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
      this.timeToLogout--;
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
