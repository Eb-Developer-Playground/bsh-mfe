import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MessageBoxType, ToastService } from '../toast';
import { MatSelectChange } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { AccountStatementService } from '@app/core/services/account-statement/account-statement.service';
import {
  PDFData,
  PdfDialogComponent,
} from '@app/shared/components/dialog/pdf-dialog/pdf-dialog.component';
import { MatDialog } from '@angular/material/dialog';

export declare interface Status {
  value: string;
  label: string;
  description: string;
}

export declare interface IApprovalStatus {
  status: 'submit' | 'reject' | 'refer back';
  comment?: string;
}

@Component({
  selector: 'app-ticket-approval',
  templateUrl: './ticket-approval.component.html',
  styleUrls: ['./ticket-approval.component.scss'],
})
export class TicketApprovalComponent implements OnInit {
  @Input() title: string =
    'CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.APPROVAL';
  @Input() disabledSummitButton = false;
  @Input() description: string =
    'CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.APPROVAL-INSTRUCTION';
  @Output() onSubmit: EventEmitter<IApprovalStatus> =
    new EventEmitter<IApprovalStatus>();
  @Output() onAbort: EventEmitter<any> = new EventEmitter<any>();
  @Input() statusOptions: string[] = ['submit', 'reject', 'refer back'];
  @Input() approveValue: string = 'submit';
  @Input() returnValue: string = 'refer back';
  @Input() rejectValue: string = 'reject';
  @Input() inProcess: boolean = false;
  @Input() base64String = '';
  @Input() pdfInfo!: any;
  statusItems: Status[] = [
    {
      value: 'submit',
      label: 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.APPROVE',
      description: 'BULK-TRANFER.DETAILS-PROVIDED',
    },
    {
      value: 'refer back',
      label: 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-MANDATE-ACCOUNT.RETURN',
      description: 'BULK-TRANFER.NEED-CORRECTION',
    },
    {
      value: 'reject',
      label: 'CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.REJECT',
      description: 'BULK-TRANFER.NOT-GENUINE',
    },
  ];
  selectedItem!: Status;
  status!: 'submit' | 'reject' | 'refer back' | 'close';
  @Input() ticket: any;
  @Input() returnEnabled: boolean = false;
  @Input() isPrinted: boolean = false;

  private accountStatementService = inject(AccountStatementService);

  get selectableStatuses(): Status[] {
    return this.statusItems.filter(i => this.statusOptions.includes(i.value));
  }

  constructor(
    private router: Router,
    private toast: ToastService,
    private translateService: TranslateService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {}

  get canBeSubmitted(): boolean {
    return (
      this.ticket?.status === 'SubmittedToChecker' ||
      this.ticket?.status === 'Submitted To Checker' ||
      this.ticket?.status === 'SubmittedToCardCenter' ||
      this.ticket?.status === 'SubmittedToOperationsManager' ||
      this.ticket?.status === 'SubmittedToCheckerLevel1'
    );
  }

  get isSubmittedToCardCenter() {
    return (
      this.ticket?.status === 'SubmittedToCardCenter' ||
      this.ticket?.status === 'Submitted To Card Center'
    );
  }

  // ngOnChanges(changes: SimpleChanges) {

  //     console.log(changes.disabledSummitButton.currentValue)
  //  }

  selectionChanged(status: MatSelectChange) {
    this.status = status.value.value;
    if (
      ['reject', 'refer back'].includes(this.status) ||
      this.approvalCommentsRequired()
    )
      this.toast.show('COMMON.PROVIDE-COMMENT', '', MessageBoxType.INFO);
  }

  submit(data: {
    status: 'submit' | 'reject' | 'refer back' | 'close';
    comment?: string;
  }): void {
    let decision: any;
    switch (data.status) {
      case 'submit':
        decision = this.approveValue || 'submit';
        break;
      case 'refer back':
        decision = this.returnValue || 'refer back';
        break;
      case 'close':
        decision = 'close';
        break;
      default:
        decision = this.rejectValue || 'reject';
    }
    this.onSubmit.emit({ status: decision, comment: data.comment });
  }

  abort(): void {
    this.onAbort.emit({});
  }

  redirectToDashboard() {
    this.router.navigateByUrl('/dashboard').then(m => {});
  }

  get actionsDescription(): string {
    const actions = this.selectableStatuses.map((status: any) =>
      this.translateService.instant(status.label)
    );
    const ticketLabel = this.translateService.instant('TICKETS.LABELS.TICKET');
    return `${this.joinActionStrings(actions)} ${ticketLabel}`;
  }

  joinActionStrings(actions: Array<string>): string {
    if (actions.length < 3) return actions.join(' or ');
    const last = actions.pop();
    return `${actions.join(', ')} or ${last}`;
  }

  approvalCommentsRequired() {
    switch (this.ticket.actionFlow.name) {
      case 'TransactionLimitFlow':
        return true;
      default:
        return false;
    }
  }

  onClose() {
    this.router.navigateByUrl('/dashboard').then(r => {});
  }

  onClickDownloadPdf() {
    this.openPreviewDocument(0);
  }

  private markAsPrinted() {
    if (this.isPrinted) return;

    this.accountStatementService
      .setPartialData('isPrinted', { isPrinted: true }, this.ticket.id)
      .subscribe({
        next: () => {
          this.isPrinted = true;
          this.toast.show(
            'CUSTOMER.ACCOUNT-SERVICES.STATEMENT.MARKED-AS-PRINTED',
            'TOAST.TITLE',
            MessageBoxType.SUCCESS
          );
        },
        error: () => {
          console.error('Failed to mark ticket as printed');
        }
      });
  }

  openPreviewDocument(documentId: number): void {
    const data: PDFData = {
      fileName: 'AccountStatement',
      base64String: this.base64String,
      deliveryMode: this.pdfInfo.delivery,
    };

    let dialogRef = this.dialog.open(PdfDialogComponent, {
      width: '831px',
      height: 'auto',
      data,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.isPrinted) {
        this.markAsPrinted();
      }
    });
  }
}
