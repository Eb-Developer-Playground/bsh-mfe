import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { PdfViewerModule } from 'ng2-pdf-viewer';

@Component({
  selector: 'app-pdf-dialog',
  templateUrl: './pdf-dialog.component.html',
  styleUrls: ['./pdf-dialog.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
    PdfViewerModule,
  ],
})
export class PdfDialogComponent implements OnInit {
  fileName = 'fileName';
  src!: Uint8Array;
  deliveryMode = '';

  constructor(
    public dialogRef: MatDialogRef<PdfDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PDFData | string
  ) {}

  ngOnInit(): void {
    if (typeof this.data !== 'string') {
      this.fileName = this.data.fileName;
      this.deliveryMode = this.data.deliveryMode;
      this.data = this.data.base64String;
    }
    this.src = this._base64ToArrayBuffer(this.data as string);
  }

  _base64ToArrayBuffer(base64: string) {
    let binary_string = base64.replace(/\\n/g, '');
    binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) { bytes[i] = binary_string.charCodeAt(i); }
    return bytes;
  }

  downloadFile() {
    const fileUrl = 'data:' + 'application/pdf' + ';base64,' + this.data;
    fetch(fileUrl).then(response => response.blob()).then(blob => {
      const link = window.document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = this.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  public printPdf() {
    const source = `data:application/pdf;base64,${this.data}`;
    const iframe = "<iframe width='100%' height='100%' src='" + source + "'></iframe>";
    const x = (window as any).open();
    x.document.open();
    x.document.write(iframe);
    x.document.close(iframe);
    document.location.href = source;
  }

  closeDialog() { this.dialogRef.close(); }
}

export interface PDFData {
  fileName: string;
  base64String: string;
  deliveryMode: string;
}
