import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { StandingOrderService } from 'src/app/core/services/standing-order/standing-order.service';

@Component({
  selector: 'app-success',
  templateUrl: './success.component.html',
  styleUrls: ['./success.component.scss'],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatCardModule,
    MatButtonModule,
  ],
})
export class SuccessComponent implements OnInit, OnDestroy {
  cif: any;
  accountNumber: any;
  customerName: any;
  isCustomerPresent: any;
  customer: any;
  standingOrderDetails: any;
  currency: any;
  amount: any;
  beneficiaryBank: any;
  beneficiaryName: any;
  paymentFrequency: any;
  dayOfExecution: any;

  constructor(
    private router: Router,
    private standingOrderService: StandingOrderService
  ) {
    this.customer = JSON.parse(<string>localStorage.getItem('accMgntObj'));
  }

  ngOnInit(): void {
    let currentAccount = this.standingOrderService.getAccountDetail();
    let standingOrderObj: any = localStorage.getItem('standing-order-details');
    this.standingOrderDetails = JSON.parse(standingOrderObj);
    this.cif = currentAccount?.cif;
    this.accountNumber = currentAccount.accountNumber;
    this.customerName = currentAccount.accountName;
    this.currency = this.standingOrderDetails?.payment.paymentCurrency;
    this.amount = this.standingOrderDetails?.payment.amountToSend;
    this.beneficiaryBank =
      this.standingOrderDetails.beneficiary.beneficiaryBank;
    this.beneficiaryName =
      this.standingOrderDetails.beneficiary.beneficiaryName;
    this.paymentFrequency = this.standingOrderDetails.payment.PaymentFrequency;
    this.dayOfExecution = this.standingOrderDetails.payment?.dayOfExecution;
    this.isCustomerPresent = this.customer?.isPresent;
  }

  onClick() {
    this.isCustomerPresent
      ? this.router.navigate(['/services/customer-360'])
      : this.router.navigate(['/dashboard']);
  }

  ngOnDestroy() {
    localStorage.removeItem('standing-order-details');
  }
}
