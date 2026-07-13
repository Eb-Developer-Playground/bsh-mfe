import {
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../services';
import { DocumentPreviewComponent } from '../preview/document-preview.component';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FileSizePipe } from '../file-size.pipe';

@Component({
  selector: 'app-documents-review',
  templateUrl: './documents-review.component.html',
  styleUrls: ['./documents-review.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    FileSizePipe,
  ],
})
export class DocumentsReviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticketId!: any;
  @Input() documents!: any[];
  @Input() contentOnly!: boolean;
  @Input() elevated!: boolean;
  private api = inject(ApiService);
  private dialog = inject(MatDialog);
  private cd = inject(ChangeDetectorRef);
  private destroy$ = new Subject();

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['ticketId']?.currentValue) {
      this.getDocuments();
    }
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

    return (
      this.api
        // @ts-ignore
        .postBlob<any>('/v2/documents/download', {
          id: obj.id.toString(),
          service: obj?.service ? obj.service : 'NewGen',
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
        })
    );
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
      .subscribe(() => {});
  }

  getDocuments(): void {
    const data = {
      ticketNumber: this.ticketId.toString(),
      service: 'NewGen',
      Cif: '',
    };
    this.api
      .post<any>('/v2/documents/search', data)
      .subscribe((res: { responseObject: any; successful: boolean }) => {
        if (res.successful) {
          this.documents = res.responseObject;
          this.cd.detectChanges();
        }
      });
  }
}
