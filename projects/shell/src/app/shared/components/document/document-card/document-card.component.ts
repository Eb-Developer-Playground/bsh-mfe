import { Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TicketService } from 'src/app/core/services/ticket/tickets.service';
import { DocumentPreviewComponent } from '../document-preview/document-preview.component';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

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
    private ticketsService: TicketService
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

    this.ticketsService['getTicketDoc'](data)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        const blob: any = new Blob([res], { type: 'octet/stream' });
        const url = window.URL.createObjectURL(blob);
        const dialogRef = this.dialog.open(DocumentPreviewComponent, {
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
