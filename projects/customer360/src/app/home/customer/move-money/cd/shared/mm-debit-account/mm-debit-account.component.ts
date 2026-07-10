import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, of, Subject, takeUntil } from 'rxjs';

import { AccountMgt } from '@app/shared/models/common/account.model';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-mm-debit-account',
  templateUrl: './mm-debit-account.component.html',
  styleUrl: './mm-debit-account.component.scss',
  imports: [TranslatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
})
export class MmDebitAccountComponent implements OnDestroy {
  @Input() form!: FormGroup;
  @Input() accounts: any;
  @Input() selectedDebitAccount!: AccountMgt.Account;
  @Input() lockedForm: boolean = false;

  @Output() updateValidBeneficiaryAccounts = new EventEmitter();

  constructor(private sharedLogicService: MmSharedLogicService) {}

  destroy$: Subject<any> = new Subject<any>();

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
  generateAccountInitials(accName: string) {
    return this.sharedLogicService.generateAccountInitials(accName);
  }
  generateAccountNames(accName: string) {
    return this.sharedLogicService.generateAccountNames(accName);
  }
}
