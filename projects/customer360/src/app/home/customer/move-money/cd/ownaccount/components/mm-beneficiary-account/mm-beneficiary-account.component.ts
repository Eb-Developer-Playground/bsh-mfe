import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccountMgt } from '@app/shared/models/common/account.model';
import { Observable, of, Subject, takeUntil } from 'rxjs';
import { MmSharedLogicService } from '@app/home/customer/move-money/cd/shared/mm-shared-logic.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-mm-beneficiary-account',
  templateUrl: './mm-beneficiary-account.component.html',
  styleUrl: './mm-beneficiary-account.component.scss',
  imports: [TranslatePipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
})
export class MmBeneficiaryAccountComponent implements OnDestroy {
  @Input() form!: FormGroup;
  @Input() accounts: any;
  @Input() lockedForm: boolean = false;

  destroy$: Subject<any> = new Subject<any>();

  constructor(private sharedLogicService: MmSharedLogicService) {}

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
