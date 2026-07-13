import { Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '@app/shared/services/api.service';
import { PreviewComponent } from '../preview/preview.component';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentCardComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('attachments') attachment: any;
  @Output() onFileUpload: EventEmitter<any> = new EventEmitter();
  @Output() onDeleteUpload: EventEmitter<any> = new EventEmitter();
  @Input() doc: any = {
    id: '',
    documentName: null,
    icon: '',
    size: '',
    filename: '',
  };
  bgImage = './assets/images/illustration-background.svg';
  prevImage = './assets/images/equity-img.png';
  destroy$: Subject<any> = new Subject<any>();

  constructor(
    public dialog: MatDialog,
    private api: ApiService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['doc'].currentValue) {
      this.doc = changes['doc'].currentValue;
    }
  }

  previewDocument(docId: any, docFileName: any) {
    const data = {
      id: docId.toString(),
      service: 'NewGen',
    };
    this.api
      // @ts-ignore
      .postBlob<any>('/v2/documents/download', data)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        const blob: any = new Blob([res], { type: 'octet/stream' });
        const url = window.URL.createObjectURL(blob);
        const dialogRef = this.dialog.open(PreviewComponent, {
          data: {
            url,
            blob,
            docFileName,
            type: 'octet/stream',
          },
        });
        dialogRef
          .afterClosed()
          .pipe(takeUntil(this.destroy$))
          .subscribe(r => {});
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
