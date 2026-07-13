import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@Component({
  selector: 'app-mm-local-beneficiary-account',
  templateUrl: './mm-local-beneficiary-account.component.html',
  styleUrl: './mm-local-beneficiary-account.component.scss',
  imports: [TranslatePipe, AsyncPipe, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule],
})
export class MmLocalBeneficiaryAccountComponent implements OnDestroy, OnInit {
  @Input() form!: FormGroup;

  destroy$: Subject<any> = new Subject<any>();

  availableBanks!: Observable<any[]>;
  availableBranches!: Observable<any[]>;

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  ngOnInit() {
    this.setSubscriptions();
  }

  getBranchDetails() {
    //API call for branch and bank name
  }

  private setSubscriptions() {
    
  }
}
