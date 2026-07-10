import { AfterViewInit, ChangeDetectorRef, Component, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    MatDialogModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class InfoDialogComponent implements AfterViewInit {
  body!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.body = `${this.data.selector}`;
    }, 0);
  }
}
