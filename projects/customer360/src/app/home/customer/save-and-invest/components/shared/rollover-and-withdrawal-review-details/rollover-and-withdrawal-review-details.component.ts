import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-rollover-and-withdrawal-review-details',
  templateUrl: './rollover-and-withdrawal-review-details.component.html',
  styleUrls: ['./rollover-and-withdrawal-review-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class RolloverAndWithdrawalReviewDetailsComponent implements OnInit {
  @Input() formData!: any;
  @Input() creationType!: string | null;
  rolloverOption!: string;
  constructor() {}

  ngOnInit(): void {
    this.rolloverOption = this.formData?.rolloverOption?.name;
  }
}
