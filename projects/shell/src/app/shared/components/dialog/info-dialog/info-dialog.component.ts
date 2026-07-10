import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-info-dialog',
  templateUrl: './info-dialog.component.html',
  styleUrls: ['./info-dialog.component.scss'],
})
export class InfoDialogComponent implements OnInit, AfterViewInit {
  body!: string;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.body = `${this.data.selector}`;
    }, 0);
  }
}
