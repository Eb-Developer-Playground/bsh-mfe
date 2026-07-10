import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogConfirmComponent } from '../dialog/dialog-confirm/dialog-confirm.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-file-box',
  templateUrl: './file-box.component.html',
  styleUrls: ['./file-box.component.scss'],
})
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
