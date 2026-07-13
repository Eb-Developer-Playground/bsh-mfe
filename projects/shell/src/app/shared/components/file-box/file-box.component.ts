import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DialogConfirmComponent } from '../dialog/dialog-confirm/dialog-confirm.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-file-box',
  templateUrl: './file-box.component.html',
  styleUrls: ['./file-box.component.scss'],
  imports: [CommonModule, FlexLayoutModule, MatButtonModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class FileBoxComponent implements OnInit {
  @Input() file: any;
  @Input() deleteIcon = true;
  @Output() confirmEmitter: EventEmitter<boolean> = new EventEmitter();

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  deleteDocument(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      height: 'auto',
      data: { title: ' Are you sure ? ' },
    });

    dialogRef.afterClosed().subscribe(option => {
      this.confirmEmitter.next(option);
    });
  }
}
