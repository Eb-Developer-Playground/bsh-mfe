import { Component, OnInit, OnDestroy, ChangeDetectorRef, Input } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ApiService, SessionService } from '@app/shared/services';
import { AccountService } from '@app/core/services/account/account.service';
import { ContextManager } from '@app/shared/modules/stepper';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { SignatoryImages } from './signatory.interface';
import { Mandate } from '@app/shared/models/common/mandate.model';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AccountSelectionService } from '@app/core/services/account-selection/account-selection.service';
import { CommonModule } from '@angular/common';
import { CollapsibleComponent } from '@app/shared/modules/new-collapsible-section/collapsible.component';
import { SignatorySliderComponent } from './signatory-slider/signatory-slider.component';
import { SignatoriesListComponent } from './signatories-list/signatories-list.component';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-current-mandate-signatories',
  templateUrl: './current-mandate-signatories.component.html',
  styleUrls: ['./current-mandate-signatories.component.scss'],
  imports: [
    CommonModule,
    TranslatePipe,
    CollapsibleComponent,
    SignatorySliderComponent,
    SignatoriesListComponent,
    ReactiveFormsModule,
  ],
})
export class CurrentMandateSignatoriesComponent implements OnInit, OnDestroy {
  @Input() mandateForm!: UntypedFormGroup;
  @Input() isAccountSelected: boolean = false;
  signatories: Mandate[] = [];
  signatoriesImages: SignatoryImages[] = [];
  mandateDetailsForm!: UntypedFormGroup;
  selectedAccount: any;
  mandates: Mandate[] = [];
  previousMandates: Mandate[] = [];
  customerDetails: any;
  accMgntObj = JSON.parse(<string>localStorage.getItem('accMgntObj'));
  translatedTitle: string = '';

  private destroy$ = new Subject<void>();

  constructor(
    public translateService: TranslateService,
    private api: ApiService,
    private fb: UntypedFormBuilder,
    private accountService: AccountService,
    private accountManagementService: AccountManagementService,
    private cdr: ChangeDetectorRef,
    private sessionService: SessionService,
    private ctxManager: ContextManager,
    private domSanitizer: DomSanitizer,
    private accountSelectionService: AccountSelectionService
  ) {
    this.customerDetails = this.accountManagementService.getCustomerDetails();
  }

  ngOnInit(): void {
    const data = this.ctxManager.currentContextData;
    this.mandateForm
      .get('account')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(acc => {
        this.getSignatories(acc);
        this.getSignatoriesImages(acc);
      });
    if (data.selectedAccount?.accountNumber) {
      this.getSignatories(data.selectedAccount?.accountNumber);
      this.getSignatoriesImages(data.selectedAccount?.accountNumber);
    }

    this.translateService
      .get('CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.ACCOUNT-SIGNATORIES')
      .pipe(takeUntil(this.destroy$))
      .subscribe(translatedTitle => {
        this.translatedTitle = translatedTitle;
        this.cdr.detectChanges();
      });

    this.accountSelectionService.selectedAccount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(selectedAccount => {
        if (selectedAccount && selectedAccount.accountNumber !== this.selectedAccount?.accountNumber) {
          this.clearSignatoryData();
          this.getSignatories(selectedAccount.accountNumber);
          this.getSignatoriesImages(selectedAccount.accountNumber);
        }
      });
  }

  onAccountChange(account: any): void {
    this.clearSignatoryData();
    this.selectedAccount = account;
    this.getSignatories(account);
    this.getSignatoriesImages(account);
  }

  private getSignatories(accountNumber: string) {
    const payload: {
      AccountId: string;
      BankId: string;
    } = {
      AccountId: accountNumber,
      BankId: this.sessionService.userBank,
    };

    this.accountService
      .getAccountSignatories(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.signatories = data.responseObject.mandates;

        this.cdr.detectChanges();
      });
  }

  private getSignatoriesImages(accountNumber: string) {
    const payload: {
      AccountId: string;
      customerId: string;
    } = {
      AccountId: accountNumber,
      customerId: this.accMgntObj.cif,
    };

    this.accountService
      .fetchPhoto(payload, 'v1')
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const filteredImagesArray = data.responseObject;

        if (filteredImagesArray.length > 0) {
          this.signatoriesImages = filteredImagesArray.map((v: any) => {
            return {
              photo: this.domSanitizer.bypassSecurityTrustUrl(
                'data:image/jpeg;base64,' + v?.returnedPhotographFiels
              ),
              signaturePhoto: this.domSanitizer.bypassSecurityTrustUrl(
                'data:image/jpeg;base64,' + v?.returnedSignatureField
              ),
              effectiveDate: v?.effectiveDateField,
              active: v?.isActive,
              expired: v?.isExpired,
              remarksField: v?.remarksField,
            };
          });
        }

        this.cdr.detectChanges();
      });
  }

  get titleWithCounter(): string {
    return `${this.translatedTitle} (${this.signatories.length})`;
  }

  private clearSignatoryData(): void {
    this.signatories = [];
    this.signatoriesImages = [];
    this.mandates = [];
    this.previousMandates = [];
    this.accountSelectionService.clearSignatoryCache();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
