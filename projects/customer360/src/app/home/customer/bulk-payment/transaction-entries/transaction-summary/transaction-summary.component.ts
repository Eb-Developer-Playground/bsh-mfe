import {
  Component,
  OnChanges,
  OnInit,
  SimpleChanges,
  Input,
  ChangeDetectorRef,
} from '@angular/core';
import { NgFor, DecimalPipe } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-transaction-summary',
  templateUrl: './transaction-summary.component.html',
  styleUrls: ['./transaction-summary.component.scss'],
  imports: [
    NgFor,
    DecimalPipe,
    TranslatePipe,
    MatIconModule,
  ],
})
export class TransactionSummaryComponent implements OnInit {
  @Input() totalAmount!: any;
  @Input() charge!: any;

  currencies = [
    { currency: 'KES', icon: 'ic-shilling' },
    { currency: 'USD', icon: 'ic-dollar' },
    { currency: 'EUR', icon: 'ic-euro' },
    { currency: 'GBP', icon: 'ic-pound' },
  ];

  constructor(
    public translateService: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {}
}
