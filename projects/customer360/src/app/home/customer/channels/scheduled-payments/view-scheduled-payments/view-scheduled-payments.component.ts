import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { DocumentPreviewComponent } from '@app/shared/modules/upload-docs';
import { MatDialog } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe, DecimalPipe, TitleCasePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-view-scheduled-payments',
  templateUrl: './view-scheduled-payments.component.html',
  styleUrls: ['./view-scheduled-payments.component.scss'],
  imports: [
    TranslatePipe,
    DatePipe,
    DecimalPipe,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatDividerModule,
    DocumentPreviewComponent,
    TitleCasePipe,
  ],
})
export class ViewScheduledPaymentsComponent implements OnInit, OnDestroy {
  schedule: any = JSON.parse(<string>localStorage.getItem('scheduleDetails'));
  scheduleObj = this.schedule?.data;
  scheduleStatus: any = this.schedule?.status;

  private destroy$ = new Subject();

  constructor(
    public router: Router,
    public dialog: MatDialog
    // private route: ActivatedRoute,
    // private fb: FormBuilder,
    // private toast: ToastService,
    // private SchedulePaymentService: SchedulePaymentService
  ) {
    if (!this.schedule) {
      this.router.navigate([
        '/services/customer-360/channels/scheduled-payments',
      ]);
    }
  }

  ngOnInit(): void {
  }

  camelCaseToSpaces(input: string): string {
    return input?.replace(/([A-Z])/g, ' $1').trim();
  }

  onPreview(doc: any) {
    const dataFormat =
      doc.format === 'pdf'
        ? 'data:application/pdf;base64,'
        : 'data:octet/stream;base64,';

    this.openPreviewDialog({
      data: `${dataFormat}${doc.documentValue}`,
      filename: doc.documentName,
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
      .subscribe(() => {});
  }

  updateSchedule() {
    localStorage.setItem('scheduleDetailss', JSON.stringify(this.schedule));
    this.router.navigate([
      '/services/customer-360/channels/update-scheduled-payments',
    ]);
  }

  cancelSchedule() {
    this.router.navigate([
      '/services/customer-360/channels/cancel-scheduled-payments',
    ]);
    localStorage.setItem('scheduleDetailss', JSON.stringify(this.schedule));
  }

  ngOnDestroy(): void {
    if (this.schedule) {
      localStorage.removeItem('scheduleDetails');
    }
  }
}
