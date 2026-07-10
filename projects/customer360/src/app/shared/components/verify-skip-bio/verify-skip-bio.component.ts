import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verify-skip-bio',
  template: `<div>{{ 'BIOMETRICS.SKIP-BIOMETRIC' | translate }} - TODO: Implement</div>`,
  styles: [],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe,
  ],
})
export class VerifySkipBioComponent {
  constructor() { }
}
