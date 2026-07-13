import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Subject } from 'rxjs';
import { FileSizePipe } from '@app/shared/modules/upload-docs/file-size.pipe';

@Component({
  selector: 'app-mm-document',
  templateUrl: './mm-document.component.html',
  styleUrl: './mm-document.component.scss',
  imports: [MatDialogModule, MatIconModule, FileSizePipe],
})
export class MmDocumentComponent implements OnDestroy {
  @Input() document: any;
  @Input() isServerFile: boolean = false;
  @Input() isLocalBase64: boolean = false;

  destroy$: Subject<any> = new Subject<any>();

  constructor(public dialog: MatDialog) {}

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  viewDocument() {
    const base64 = this.document?.data;
    const mimeType = base64?.includes('data:') ? base64.split(';')[0].split(':')[1] : 'application/octet-stream';
    const byteCharacters = atob(base64?.split(',')[1] || base64 || '');
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}
