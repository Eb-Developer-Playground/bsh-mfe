import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-review-account-restriction',
  templateUrl: './review-account-restriction.component.html',
  styleUrls: ['./review-account-restriction.component.scss'],
  imports: [
    MatDialogModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
  ],
})
export class ReviewAccountRestrictionComponent implements OnInit {
  accounts!: any[];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ReviewAccountRestrictionComponent>
  ) {}

  ngOnInit(): void {
    this.accounts = this.data.accounts;
  }

  submit() {
    this.dialogRef.close(this.data);
  }
}
