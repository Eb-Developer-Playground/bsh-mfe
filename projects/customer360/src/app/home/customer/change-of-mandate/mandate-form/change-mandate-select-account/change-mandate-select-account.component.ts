import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { NgForOf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import {
  ContextManager,
} from '@app/shared/modules/stepper';

@Component({
  selector: 'app-change-mandate-select-account',
  templateUrl: './change-mandate-select-account.component.html',
  styleUrls: ['./change-mandate-select-account.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatSelectModule,
    NgForOf,
    TranslatePipe,
  ],
})
export class ChangeMandateSelectAccountComponent implements OnInit, OnDestroy {
  @Input() mandateForm!: UntypedFormGroup;
  @Output() accountSelected = new EventEmitter<any>();
  accountForm!: UntypedFormGroup;
  accounts: any[] = JSON.parse(<string>localStorage.getItem('accounts'));
  process?: string;
  relatedAccounts: any[] = JSON.parse(
    <string>localStorage.getItem('relatedAccounts')
  );
  filteredAccounts: any[] = [];
  destroy$: Subject<any> = new Subject<any>();
  mandateAccount: any;
  isSignatoryFlow: boolean = false;

  constructor(
        private readonly ctxManager: ContextManager,
  ) {}

  ngOnInit() {
    const context = this.ctxManager.currentContextData;
    this.process = context?.process;
    const allAccounts = [
      ...(this.accounts || []).filter(acc => acc.schemeType !== 'LAA'),
      ...(this.relatedAccounts || [])
    ];
    this.filteredAccounts = allAccounts.filter(acc => acc.accountStatus === 'A' && acc.mandate !== 'SELF');

    if (context?.updateMandate && context.selectedAccount) {
      this.isSignatoryFlow = true;
      this.mandateAccount = context.selectedAccount.accountNumber;

      this.mandateForm.patchValue({ account: this.mandateAccount });

      this.accountSelected.emit(context.selectedAccount);
    }
  }

  onAccountChange(selectedAccountNumber: string) {
    const selectedAccount = this.filteredAccounts.find(acc => acc.accountNumber === selectedAccountNumber);
    if (selectedAccount) {
      this.accountSelected.emit(selectedAccount);
    }
  }

  trackByAccount(index: number, item: any) {
    return item.accountNumber;
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
