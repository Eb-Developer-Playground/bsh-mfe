import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subject, from } from 'rxjs';
import { mergeMap, takeUntil } from 'rxjs/operators';
import { ApiService } from '@shared/services';
import { DocumentPreviewComponent } from '@shared/modules/upload-docs';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-documents-review',
  templateUrl: './documents-review.component.html',
  styleUrls: ['./documents-review.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentsReviewComponent implements OnInit, OnChanges, OnDestroy {
  @Input() ticketId!: any;
  @Input() documents!: any[];
  @Input() contentOnly!: boolean;
  @Input() elevated!: boolean;
  private destroy$ = new Subject();

  constructor(
    private api: ApiService,
    private dialog: MatDialog,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ticketId?.currentValue) {
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
      .subscribe(r => {});
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
