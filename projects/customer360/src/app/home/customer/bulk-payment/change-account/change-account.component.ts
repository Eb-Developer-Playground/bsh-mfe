import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-change-account',
  templateUrl: './change-account.component.html',
  styleUrls: ['./change-account.component.scss'],
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class ChangeAccountComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ChangeAccountComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public translateService: TranslateService
  ) {}

  ngOnInit(): void {}

  closeDialog(value: boolean): void {
    this.dialogRef.close(value);
  }

  submit(value: boolean) {
    this.dialogRef.close(value);
  }
}
