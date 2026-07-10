import { Component, Inject, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss'],
})
export class PreviewComponent implements OnInit {
  sanitizedURL: any;
  imgError!: boolean;
  isImage = true;

  constructor(
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    const getPdfUrl = this.getPdf();
    if (getPdfUrl) {
      this.sanitizedURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${getPdfUrl}`
      );
    } else {
      this.sanitizedURL = this.sanitizer.bypassSecurityTrustResourceUrl(
        `${this.data.url}`
      );
    }
  }

  documentDownload() {
    const a = document.createElement('a');
    document.body.appendChild(a);
    // const url = window.URL.createObjectURL(this.data.blob);
    a.href = this.data.url;
    a.download = this.data.docFileName;
    a.click();
    document.body.removeChild(a);
  }

  private getPdf() {
    if (this.data?.docFileName?.split('.')[1]?.toLowerCase() === 'pdf') {
      const file = new Blob([this.data.blob], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      //can take base64.
      this.isImage = false;
      return fileURL;
    }
    return null;
  }
}
