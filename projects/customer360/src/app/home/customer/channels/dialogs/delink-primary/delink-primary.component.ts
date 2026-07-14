import { Component, Inject } from '@angular/core';

import { Router } from '@angular/router';
import { MatRadioChange, MatRadioModule } from '@angular/material/radio';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delink-primary',
  templateUrl: './delink-primary.component.html',
  styleUrls: ['./delink-primary.component.scss'],
  imports: [MatRadioModule, MatDialogModule, MatIconModule, MatButtonModule],
})
export class DelinkPrimaryComponent {
  optionChangeEvent!: MatRadioChange;
  accounts: any[];
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<DelinkPrimaryComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router
  ) {
    this.accounts = data.accounts;
  }
}
