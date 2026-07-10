import { Component, Inject, OnInit } from '@angular/core';
import { IUploadedDocument } from '../models';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  templateUrl: './docs-status.dialog.html',
  styleUrls: ['./docs-status.dialog.scss'],
})
export class DocsStatusDialog implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: IUploadedDocument[]) {}

  ngOnInit(): void {}
}
