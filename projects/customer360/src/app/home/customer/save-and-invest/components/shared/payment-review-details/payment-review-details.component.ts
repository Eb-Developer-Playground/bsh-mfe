import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-review-details',
  templateUrl: './payment-review-details.component.html',
  styleUrls: ['./payment-review-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class PaymentReviewDetailsComponent implements OnInit {
  @Input() formData!: any;
  @Input() paymentDetails!: any;
  @Input() creationType!: string | null;

  remainingBalance = 0;
  constructor() {}

  ngOnInit(): void {
    this.remainingBalance =
      this.paymentDetails?.availableBalance - this.formData?.initialAmount;
  }
}
