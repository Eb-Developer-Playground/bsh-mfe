import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-investment-review-details',
  templateUrl: './investment-review-details.component.html',
  styleUrls: ['./investment-review-details.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDividerModule,
    TranslatePipe,
  ],
})
export class InvestmentReviewDetailsComponent implements OnInit {
  @Input() formData!: any;
  @Input() creationType!: string | null;

  constructor() {}

  ngOnInit(): void {}
}
