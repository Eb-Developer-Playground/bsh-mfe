import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IUploadedDocument } from '../models';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { FilenameLabelPipe } from '../filenameLabel.pipe';

@Component({
  selector: 'app-dialog',
  templateUrl: './docs-status.dialog.html',
  styleUrls: ['./docs-status.dialog.scss'],
  imports: [COMPAT_IMPORTS, FilenameLabelPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocsStatusDialog implements OnInit {
  constructor(@Inject(MAT_DIALOG_DATA) public data: IUploadedDocument[]) {}

  ngOnInit(): void {}
}
