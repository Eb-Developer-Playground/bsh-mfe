import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelsService } from '@app/core/services/channels/channels.service';
import { Subject, takeUntil } from 'rxjs';
import { DocumentPreviewComponent } from 'src/app/shared/modules/upload-docs';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule, DatePipe, DecimalPipe, TitleCasePipe, Location } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';

import { localDate } from '@shared/utils/date.utils';

@Component({
  selector: 'app-channel-trans-details',
  templateUrl: './channel-trans-details.component.html',
  styleUrls: ['./channel-trans-details.component.scss'],
  imports: [
    MatCardModule,
    TranslatePipe,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    TitleCasePipe,
    DatePipe,
    DecimalPipe,
    CommonModule,
    MatExpansionModule,
    MatButtonModule,
    RouterModule,
  ],
  providers: [DatePipe],
})
export class ChannelTransDetailsComponent implements OnInit, OnDestroy {
  panelOpenState: boolean = true;
  transDetailsObj = JSON.parse(<string>localStorage.getItem('transDetails'));
  transactionDate!: any;
  signatoryApprovalDate!: any;
  isJointAccountTransaction: boolean = false;
  private destroy$ = new Subject();
  jointAccSignatoriesDetails!: any;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private channelsService: ChannelsService,
    private location: Location,
  ) {
    // if (this.transDetailsObj.hasOwnProperty("transactionRef"))
    //     this.isJointAccountTransaction = true;

    this.isJointAccountTransaction = this.transDetailsObj.isJointAccount;
  }

  ngOnInit(): void {
    const currentTime = this.transDetailsObj?.date || this.transDetailsObj?.transactionDate;
    this.transactionDate = localDate(currentTime);

    if (this.isJointAccountTransaction) {
      this.channelsService
        .getJointAccSignatories(this.transDetailsObj.reference)
        .subscribe((res: any) => {
          if (res.statusCode === '00') {
            this.jointAccSignatoriesDetails = res?.responseObject;

            const currentApprovalTime = this.jointAccSignatoriesDetails?.requestedOn;
            this.signatoryApprovalDate = localDate(currentApprovalTime);

            this.jointAccSignatoriesDetails?.approval?.signatoryApproval.forEach(
              (approver: any) => {
                const currentDeclinedTime = approver.declineOn || '';
                const approvedOnTime = approver.approvedOn || '';
                approver.declineOn = localDate(currentDeclinedTime);
                approver.approvedOn = localDate(approvedOnTime);
              },
            );
          }
        });

      // const currentApprovalTime =
      //     this.transDetailsObj?.additionalFields.requestedOn;
      // const utcTime = moment.utc(currentApprovalTime);
      // this.signatoryApprovalDate = utcTime.local();

      // this.transDetailsObj?.additionalFields.approval.signatoryApproval.forEach(
      //     (approver: any) => {
      //         const currentDeclinedTime = approver.declineOn || "";
      //         const approvedOnTime = approver.approvedOn || "";
      //         const declineOnUtcTime = moment.utc(currentDeclinedTime);
      //         const approvedOnUtcTime = moment.utc(approvedOnTime);
      //         approver.declineOn = declineOnUtcTime.local();
      //         approver.approvedOn = approvedOnUtcTime.local();
      //     }
      // );
    }
  }

  onPreview(doc: any) {
    const dataFormat =
      doc.format === 'pdf' ? 'data:application/pdf;base64,' : 'data:octet/stream;base64,';
    this.openPreviewDialog({
      data: `${dataFormat}${doc.documentValue}`,
      filename: doc.documentName,
    });
  }

  parseData = (data: string): any => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  };

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
      .subscribe((r) => {});
  }

  back() {
    window.history.back();
  }

  navToIssueLog(): void {
    localStorage.setItem('disputedTran', JSON.stringify(this.transDetailsObj));
    this.router
      .navigate(['/services/customer-360/crm'], {
        queryParams: {
          title: 'Transactional',
        },
      })
      .then(() => {});
  }

  ngOnDestroy(): void {
    if (this.transDetailsObj) {
      localStorage.removeItem('transDetails');
    }
  }

  navigateBack() {
    this.location.back();
  }
}
