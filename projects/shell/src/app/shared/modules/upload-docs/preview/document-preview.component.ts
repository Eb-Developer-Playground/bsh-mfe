import { Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MessageBoxType, ToastService } from '../../toast';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.component.html',
  styleUrls: ['./document-preview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentPreviewComponent implements OnInit, OnDestroy {
  sanitizedURL: any;
  imgError!: boolean;
  popup: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<DocumentPreviewComponent>,
    private sanitizer: DomSanitizer,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.sanitizedURL = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.data.url}`
    );
  }

  download(data: any, filename: string): void {
    const downloadLink = document.createElement('a');
    document.body.appendChild(downloadLink);
    downloadLink.href = data;
    downloadLink.target = '_self';
    downloadLink.download = filename;
    downloadLink.click();
    this.dialogRef.close();
    this.toast.show(
      null,
      'Document successfully downloaded.',
      MessageBoxType.SUCCESS,
      5000,
      undefined,
      undefined,
      false
    );
  }

  print(data: any, filename: string): void {
    const isPDF =
      this.data.filename.endsWith('pdf') || this.data.filename.endsWith('PDF');
    this.popup = window.open(data);
    this.popup.document.title = filename;
    this.popup.document.write(
      isPDF
        ? "<embed src='" +
            this.data.url +
            "' height='100%' width='100%' type='application/pdf'>"
        : "<img src='" + this.data.url + "'>"
    );
    this.popup.focus();
    this.popup.print();
    this.popup.onbeforeunload = this.closeWindow();
    this.popup.onafterprint = this.closeWindow();
  }

  openNewWindow(): void {
    const isPDF =
      this.data.filename.endsWith('pdf') || this.data.filename.endsWith('PDF');
    this.popup = window.open(this.data.url);
    this.popup.document.title = this.data.filename || 'Document Preview';
    this.popup.document.write(
      isPDF
        ? "<embed src='" +
            this.data.url +
            "' height='100%' width='100%' type='application/pdf'>"
        : "<img src='" + this.data.url + "'>"
    );
    this.popup.focus();
  }

  closeWindow() {
    if (this.popup) {
      this.popup.close();
      this.dialogRef.close();
      this.toast.show(
        null,
        'Document successfully downloaded for printing.',
        MessageBoxType.SUCCESS,
        5000,
        undefined,
        undefined,
        false
      );
    }
  }
  ngOnDestroy() {
    this.closeWindow();
  }
}
