import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from 'src/app/core/services/account/account.service';
import { DialogDocumentPreviewComponent } from 'src/app/shared/components/dialog/dialog-document-preview/dialog-document-preview.component';

@Component({
  selector: 'app-known-agent-supporting-documents',
  templateUrl: './known-agent-supporting-documents.component.html',
  styleUrls: ['./known-agent-supporting-documents.component.scss'],
})
export class KnownAgentSupportingDocumentsComponent
  implements OnInit, OnDestroy
{
  @Input() ticketId!: string;
  ticketDocs: any;
  public files = [
    { code: 1 },
    { code: 2 },
    { code: 3 },
    { code: 4 },
    { code: 5 },
    { code: 6 },
  ];

  private destroy$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
    this.getDocsForTicket();
  }

  openPreviewDocument(file: any): void {
    const dialogRef = this.dialog.open(DialogDocumentPreviewComponent, {
      width: '831px',
      height: 'auto',
      data: { file },
    });

    dialogRef.afterClosed().subscribe(option => {});
  }

  deleteDocument(confirm: any, documentId: number) {
    if (confirm === true) {
      this.files = this.files.filter(f => f.code !== documentId);
    }
  }

  private getDocsForTicket(): void {
    const data = {
      ticketNumber: this.ticketId,
      service: 'NewGen',
    };

    this.accountService
      .getTicketDocs(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          this.ticketDocs = res.responseObject;
        },
        (err: any) => console.log(err)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
