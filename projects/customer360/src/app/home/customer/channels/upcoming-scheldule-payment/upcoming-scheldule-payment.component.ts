import { Account } from '@app/home/customer/funds-transfer/funds-transfer.model';
import { SchedulePaymentService } from '@app/core/services/schedule-payment/schedule-payment.service';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService, MessageBoxType } from '@app/shared/modules/toast';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_NATIVE_DATE_FORMATS,
} from '@angular/material/core';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AppDateAdapter } from '@shared/utils/date-adapter';
import { daysAgoYMD, todayYMD } from '@shared/utils/date.utils';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe, DecimalPipe } from '@angular/common';

export const MY_DATE_FORMATS = MAT_NATIVE_DATE_FORMATS;

@Component({
  selector: 'app-upcoming-scheldule-payment',
  templateUrl: './upcoming-scheldule-payment.component.html',
  styleUrls: ['./upcoming-scheldule-payment.component.scss'],
  imports: [MatDividerModule, DatePipe, DecimalPipe],
  providers: [
    {
      provide: DateAdapter,
      useClass: AppDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
})
export class UpcomingScheldulePaymentComponent implements OnInit {
  accounts: any[] = [];
  form!: FormGroup;
  customerDetails!: any;

  constructor(
    public router: Router,
    private fb: FormBuilder,
    private toast: ToastService,
    private SchedulePaymentService: SchedulePaymentService,
    private accountManagementService: AccountManagementService
  ) {
    this.customerDetails = this.accountManagementService.getCustomerDetails();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      startDate: [daysAgoYMD(90)],
      endDate: [todayYMD()],
      direction: ['desc'],
      pageIndex: [1],
      pageSize: [5],
      customerId: [this.customerDetails?.cif],
      //sourceAccount: [""],
    });

    this.fetchPendingSchedule(this.form.value);
  }

    private fetchPendingSchedule(data: any) {
        this.SchedulePaymentService.getSchedulePayment(data)
            .subscribe({
                next: (res:any) => {
                    if (res) {
                        this.accounts = res.items;
                    } else {
                        this.toast.show(res.statusMessage, "", MessageBoxType.DANGER, 5000, undefined, undefined, false);
                    }
                },
            error: (err:any) => {
                this.toast.show( err.error.statusMessage, "", MessageBoxType.DANGER, 5000, undefined, undefined, false);
            }
            });
    }

  viewSchedule() {
    this.router.navigate([
      '/services/customer-360/channels/scheduled-payments',
    ]);
  }
}
