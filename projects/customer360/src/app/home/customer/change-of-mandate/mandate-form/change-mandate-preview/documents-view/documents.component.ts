import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { from, Subject } from 'rxjs';
import { ApiService } from '@app/shared/services';
import { DocumentPreviewComponent, FileSizePipe } from '@app/shared/modules/upload-docs';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-documents-view',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    TranslatePipe,
    DatePipe,
    FileSizePipe,
  ],
})
export class DocumentsComponent implements OnInit, OnDestroy {
  @Input() ticketId!: number | string;
  @Input() documents!: any[];
  @Input() contentOnly!: boolean;
  @Input() elevated!: boolean;
  private destroy$ = new Subject();
  documentsLoaded = false;

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  previewDocument(obj: any) {
    if (!obj.id) {
      this.openPreviewDialog({ data: obj.data, filename: obj.filename });
      return;
    }
    return this.api
      .postBlob('/v2/documents/download', {
        id: obj.id.toString(),
        service: obj?.service || 'NewGen',
      })
      .pipe(
        mergeMap((stream: any) => {
          return from(
            new Promise((resolve, _) => {
              const isPDF =
                obj?.filename?.split('.')[1]?.toLowerCase() === 'pdf';
              const contentType = isPDF ? 'application/pdf' : 'octet/stream';
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(new Blob([stream], { type: contentType }));
            })
          );
        })
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((b64: any) => {
        this.openPreviewDialog({
          data: b64,
          filename: obj.filename,
        });
      });
  }

  openPreviewDialog(document?: any) {
    const dialogRef = this.dialog.open(DocumentPreviewComponent, {
      data: {
        url: document?.data,
        filename: document?.filename || 'Document',
      },
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(r => {});
  }
}
