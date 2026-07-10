import { Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CardInputComponent } from '@app/home/customer/card-issuance/components/card-input/card-input.component';

@Component({
  selector: 'app-card-charges-section',
  templateUrl: './card-charges-section.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './card-charges-section.component.scss',
  ],
  imports: [
    ReactiveFormsModule,
    NgIf,
    MatRadioModule,
    MatFormFieldModule,
    MatSelectModule,
    CardInputComponent,
  ],
})
export class CardChargesSectionComponent {
  @Input({ required: true }) IssuanceForm!: FormGroup;
  @Input() issuanceType: 'INSTANT' | 'PREMIUM' | 'PREPAID' = 'INSTANT';
  @Input({ required: true }) cardTypeCharges: 'loading' | 'triggered' | 'n/a' =
    'n/a';
  @Input({ required: true }) accounts: {
    balance: string;
    accountCurrency: string;
    accountNumber: string;
    name: string;
    schemeCode: string;
    schemeType: string;
  }[] = [];
  get activeAccountNumber() {
    return this.IssuanceForm.get('accountNumber')?.value || '';
  }
  get activeAccountBalance() {
    if (this.activeAccountNumber) {
      const accInfo = this.accounts.find(
        acc => acc.accountNumber === this.activeAccountNumber
      );
      return accInfo ? accInfo.balance : '0';
    }
    return '0';
  }
}
