import { Component, Inject, OnInit, ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService, MessageBoxType } from '@app/shared/modules/toast';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-document-preview',
  templateUrl: './docs-preview.dialog.html',
  styleUrls: ['./docs-preview.dialog.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocsPreviewDialog implements OnInit {
  sanitizedURL: any;
  popup: any;

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<DocsPreviewDialog>,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const upload = this.data.upload.data;
    this.sanitizedURL = this.sanitizer.bypassSecurityTrustResourceUrl(upload);
  }

  documentDownload() {
    const linkSource = this.data.upload.data;
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);

    downloadLink.href = linkSource;
    downloadLink.target = '_self';
    downloadLink.download = this.data.upload.filename;
    downloadLink.click();
    this.dialogRef.close();
    this.toast.show(
      '',
      'Document successfully downloaded.',
      MessageBoxType.SUCCESS,
      5000,
      undefined,
      undefined,
      false
    );
  }

  printDocument() {
    const myImage = this.data.upload.data;
    this.popup = window.open(myImage);
    this.popup.document.title = this.data.upload.filename;
    this.popup.document.write("<img src='" + myImage + "''>");
    this.popup.focus();
    this.popup.print();
    this.popup.onbeforeunload = this.closePrint();
    this.popup.onafterprint = this.closePrint();
  }

  closePrint() {
    if (this.popup) {
      this.popup.close();
      this.dialogRef.close();
      this.toast.show(
        '',
        'Document successfully downloaded for printing.',
        MessageBoxType.SUCCESS,
        5000,
        undefined,
        undefined,
        false
      );
    }
  }
}
