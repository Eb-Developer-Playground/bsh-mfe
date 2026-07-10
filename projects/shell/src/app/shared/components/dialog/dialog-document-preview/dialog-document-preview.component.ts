import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { DomSanitizer } from '@angular/platform-browser';
import { AccountService } from 'src/app/core/services/account/account.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { SessionService } from '@app/shared/services';

@Component({
  selector: 'app-dialog-document-preview',
  templateUrl: './dialog-document-preview.component.html',
  styleUrls: ['./dialog-document-preview.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DialogDocumentPreviewComponent implements OnInit {
  anchor!: HTMLAnchorElement;
  imageUrl: any;
  showImage = false;

  constructor(
    public dialogRef: MatDialogRef<DialogDocumentPreviewComponent>,
    private accountService: AccountService,
    private domSanitizer: DomSanitizer,
    public session: SessionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}
  ngOnInit(): void {
    this.showImage = this.isImage();
    this.getImage();
  }

  isImage() {
    let ext: string = '';
    if (this.data.isLocalBase64) {
      ext = this.data.file.format;
    } else {
      ext =
        this.data.file.fileNameWithExtension?.split('.')[1] ||
        this.data?.file?.FileNameWithExtension?.split('.')[1];
    }

    switch (ext.toLowerCase()) {
      case 'png':
      case 'jpg':
      case 'jpeg':
        return true;
      default:
        return false;
    }
  }

  downloadDoc(): void {
    this.anchor.click();
    this.closeDialog();
  }

  getImage() {
    if (this.data.isLocalBase64) {
      this.anchor = document.createElement('a');
      document.body.appendChild(this.anchor);
      const blob: any = this.data.file.file;
      this.anchor.href = this.imageUrl = blob;
      this.anchor.download = this.data.file.name;
      return;
    }
    const data = {
      id: this.data?.file?.id || this.data?.file?.Id,
      service:
        this.data?.file?.service ||
        this.data?.file?.Service ||
        this.subsidiaryDocService(),
    };
    this.accountService['getTicketDoc'](data, 'v2').subscribe(
      (res: any) => {
        this.anchor = document.createElement('a');
        document.body.appendChild(this.anchor);
        const blob: any = new Blob([res], { type: 'octet/stream' });
        const url = (this.imageUrl = window.URL.createObjectURL(blob));

        this.anchor.href = url;
        this.anchor.download =
          this.data?.file?.filename || this.data?.file?.FileName;
      },
      (err: any) => {
        console.log(err);
      }
    );
  }

  sanitize(url: string) {
    return this.domSanitizer.bypassSecurityTrustUrl(url);
  }

  public printPdf(): void {
    if (this.data.isLocalBase64) {
      const printWindow = window.open(this.imageUrl);
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    } else {
      const data = {
        id: this.data?.file?.id || this.data?.file?.Id,
        service:
          this.data.file?.service ||
          this.data?.file?.Service ||
          this.subsidiaryDocService(),
      };

      this.accountService['getTicketDoc'](data, 'v2').subscribe((res: any) => {
        const blob = new Blob([res], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const printWindow = window.open(url);
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
        }
      });
    }
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close({ printed: true });
  }

  printBase64() {
    const blob = this.base64ToBlob(this.data.file.file);
    const url = URL.createObjectURL(blob);

    const printWindow = window.open(url);
    printWindow?.addEventListener('load', () => {
      printWindow.print();
      URL.revokeObjectURL(url); // Clean up the URL object
      // printWindow.close();
    });
  }

  base64ToBlob(base64: string) {
    const cleaned_base64 = base64.split(',')[1].replace(/\s/g, '');
    const byteCharacters = atob(cleaned_base64); // Decode Base64
    const mimeType = base64.split(':')[1].split(';')[0];
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType }); // Adjust MIME type as needed
  }

  subsidiaryDocService() {
    if (
      this.session.userCountryCode === 'CD' ||
      this.session.userCountryCode === 'UG'
    ) {
      return 'Blob';
    } else {
      return 'NewGen';
    }
  }
}
