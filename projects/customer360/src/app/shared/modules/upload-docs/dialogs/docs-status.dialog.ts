import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IUploadedDocument } from '../models';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { FilenameLabelPipe } from '../filenameLabel.pipe';

@Component({
  selector: 'app-dialog',
  templateUrl: './docs-status.dialog.html',
  styleUrls: ['./docs-status.dialog.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    FilenameLabelPipe,
  ],
})
export class DocsStatusDialog implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: IUploadedDocument[]) {}

  ngOnInit(): void {}
}
