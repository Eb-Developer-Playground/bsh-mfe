import { CommonModule } from '@angular/common';
import { Component,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MessageBoxType, ToastService } from '../../toast';
import {
  DedupeResultsComponent,
  IdentificationModule,
} from '@app/shared/modules/identification';
import { IdDocumentService } from '../id-document.service';
import {
  IDedupeCIFResult,
  IDedupeFieldStates,
  IDedupeFormOutput,
  IdTypeDescription,
} from '../types';
import { ApiService } from '@app/shared/services/api.service';
import { SessionService } from '@app/shared/services/session/session.service';
import { environment as env } from '../../../../../environments/environment';
import { DedupeFormComponent } from '@app/shared/modules/identification';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { TranslateService } from '@ngx-translate/core';
import CONST from '@app/shared/utils/constants';
import { NotificationsModule } from '../../notifications/notifications.module';
import {
  combineCustomerEntries,
  groupEntriesByCif,
} from '@app/shared/utils/utils';

const { COUNTRY_CODE } = CONST;

@Component({
  standalone: true,
  selector: 'app-dedupe-form-wrapper',
  templateUrl: './dedupe-form-wrapper.component.html',
  imports: [
    CommonModule,
    FormsModule,
    IdentificationModule,
    MatCardModule,
    MatButtonModule,
    NotificationsModule,
    DedupeResultsComponent,
  ],
  styleUrls: ['./dedupe-form-wrapper.component.scss']})
export class DedupeFormWrapperComponent {
  private translate = inject(TranslateService);
  @Input() subsidiary!: ISubsidiary;
  @ViewChild('dedupeFormComp') dedupeComponent!: DedupeFormComponent;
  @Output() onFinished: EventEmitter<any> = new EventEmitter<any>();
  @Input() showCustomerPresentOptions = true;
  @Input() fieldStates!: IDedupeFieldStates;
  @Input() showVerify = true;
  @Input() dedupeForm!: UntypedFormGroup;
  @Input() readonly!: boolean;
  @Input() showActions!: boolean;
  dedupeCifResults!: IDedupeCIFResult[];
  phoneflag!: boolean;
  customerId!: string | undefined;

  constructor(
    private fb: UntypedFormBuilder,
    private idDocumentService: IdDocumentService,
    private sessionService: SessionService,
    private toast: ToastService,
    private api: ApiService
  ) {
    this.dedupeForm = this.fb.group({
      nationality: ['KE', Validators.required],
      countryOfResidence: ['KE', Validators.required],
      refNum: [null, Validators.required],
      idType: [null, Validators.required],
    });
  }

  ngOnInit() {
    this.dedupeForm.patchValue({
      nationality: this.subsidiary.countryCode,
      countryOfResidence: this.subsidiary.countryCode,
    });
  }

  onDedupeResults(results: any) {
    if (this.subsidiary.countryCode === 'CD') {
      const idType = <IdTypeDescription>(
        this.idDocumentService.allIdTypeDescriptions.find(
          t => t.value === this.dedupeForm.get('idType')?.value
        )
      );

      const refNum = this.dedupeForm.get('refNum')?.value;

      // Dedupe failed
      if (!results.successful) {
        this.toast.show(
          null,
          results.statusMessage || 'Unable to dedupe',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
        this.resetSearch();
        return;
      }

      // DRC DEDUPE FLAG CHECKS
      if (
        this.subsidiary.countryCode === COUNTRY_CODE.CD &&
        results.successful
      ) {
        this.processFlags(results, idType, refNum);
        return;
      }

      /**
       * This should be set only when its not DRC subsidiary doing the onboarding
       */
      this.dedupeCifResults = results.result;

      if (results?.result?.length == 0 && results.successful) {
        // Disable dedupe form
        this.readonly = true;
        this.toast.show(
          'success',
          this.translate.instant('FORMS.DEDUPE.ERRORS.NEGATIVE_DEDUPE', {
            idType: idType.name,
            refNum: refNum,
          }),
          MessageBoxType.SUCCESS,
          5000,
          undefined,
          undefined,
          false
        );
        this.onFinished.emit({
          customerExists: false,
          idFormValue: this.dedupeForm.getRawValue(),
        });
      } else {
        // Customer exists. Offer options to reset form or go to 360 view.
        this.toast.show(
          'error',
          results.statusMessage || 'Unable to dedupe',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
        this.resetSearch();
        return;
      }

      // DRC DEDUPE FLAG CHECKS
      if (
        results.successful &&
        this.subsidiary.countryCode === COUNTRY_CODE.CD
      ) {
        this.processFlags(results, idType, refNum);
        return;
      }

      /**
       * This should be set only when its not DRC subsidiary doing the onboarding
       */
      this.dedupeCifResults = results.result;

      if (results?.result?.length === 0 && results.successful) {
        // Disable dedupe form
        this.readonly = true;
        this.toast.show(
          null,
          this.translate.instant('FORMS.DEDUPE.ERRORS.NEGATIVE_DEDUPE', {
            idType: idType.name,
            refNum: refNum,
          }),
          MessageBoxType.SUCCESS
        );
        this.onFinished.emit({
          customerExists: false,
          idFormValue: this.dedupeForm.getRawValue(),
        });
      } else {
        // Customer exists. Offer options to reset form or go to 360 view.
        const msg =
          results?.result?.length > 1
            ? 'FORMS.DEDUPE.ERRORS.POSITIVE_DEDUPE_MULTIPLE'
            : 'FORMS.DEDUPE.ERRORS.POSITIVE_DEDUPE';
        this.toast.show(
          null,
          this.translate.instant(msg, { idType: idType.name, refNum: refNum }),
          MessageBoxType.WARNING
        );

        this.customerId = this.dedupeCifResults[0]?.cifId;

        if (this.dedupeCifResults?.length === 1)
          this.onFinished.emit({
            customerExists: true,
            idFormValue: this.dedupeForm.getRawValue(),
          });
      }
    } else {
      const idType = <IdTypeDescription>(
        this.idDocumentService.allIdTypeDescriptions.find(
          t => t.value === this.dedupeForm.get('idType')?.value
        )
      );
      const refNum = this.dedupeForm.get('refNum')?.value;
      // Dedupe failed
      if (results.statusMessage === 'Unable to dedupe' || !results.successful) {
        this.toast.show(
          'error',
          'Unable to dedupe',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
        this.resetSearch();
        return;
      }
      if (
        ['User not found', 'Please enter a valid ID number'].includes(
          results?.statusMessage
        ) &&
        results.successful
      ) {
        // Disable dedupe form
        this.readonly = true;
        this.toast.show(
          null,
          `Customer with a ${idType.name} ${refNum} was NOT found.`,
          MessageBoxType.SUCCESS,
          5000,
          undefined,
          undefined,
          false
        );
        this.onFinished.emit({
          userData: null,
          idFormValue: this.dedupeForm.getRawValue(),
        });
      } else {
        // Customer exists. Offer options to reset form or go to 360 view.
        this.toast.show(
          null,
          `A customer with a ${idType.name} ${refNum} was FOUND.`,
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          false
        );
        this.customerId = results.responseObject?.cif;
        this.api
          .post<any>('/v2/account/cifinquiry', {
            CustomerID: this.customerId,
            BankID: this.sessionService.userBank,
          })
          .subscribe({
            next: result => {
              this.onFinished.emit({
                userData: result?.responseObject,
                idFormValue: this.dedupeForm.getRawValue(),
              });
            },
          });
      }
    }
  }

  onSelectedCif(cifId: string) {
    this.api
      .post<any>('/v2/account/cifinquiry', {
        CustomerID: cifId,
        BankID: this.sessionService.userBank,
      })
      .subscribe({
        next: result => {
          this.onFinished.emit({
            userData: result?.responseObject,
            idFormValue: this.dedupeForm.getRawValue(),
          });
        },
      });
  }

  resetSearch() {
    this.readonly = false;
    this.dedupeComponent.resetForm();
    this.customerId = undefined;
    this.dedupeForm.patchValue({
      nationality: this.subsidiary?.countryCode,
      countryOfResidence: this.subsidiary?.countryCode,
    });
  }

  /**
   * Processes the flags for each customer and takes actions based on their values.
   * @param result Array of customer data
   */
  goToProfile() {
    const url = new URL((env as any).appUrl);
    const params = new URLSearchParams({
      option: 'CIF',
      intent: 'canVerify',
      value: `${this.customerId}`,
    });
    url.search = params.toString();
    window.location.href = url.toString();
  }

  processFlags(results: any, idType: any, refNum: any): void {
    const { result, successful } = results;

    // Check if responseObject is empty or has no entries with cifNumber
    const isNewCustomer = successful && result.length == 0;

    // Handle new customer case
    if (isNewCustomer) {
      this.handleNewCustomer(idType, refNum);
      return;
    }

    // If we have results, group them by CIF number
    if (successful && result && result.length > 0) {
      const groupedByCif = groupEntriesByCif(result);

      // Process each group of entries that share the same CIF number
      Object.keys(groupedByCif).forEach(cifNumber => {
        const entries = groupedByCif[cifNumber];
        const combinedEntry = combineCustomerEntries(entries);

        const {
          documentNumberFlag,
          emailAddressFlag,
          dateOfBirthFlag,
          phoneNumberFlag,
        } = combinedEntry;

        // Determine which handler to call based on the combined flags
        if (
          documentNumberFlag === '1' ||
          emailAddressFlag === '1' ||
          dateOfBirthFlag === '1'
        ) {
          // Handle scenario where document/email/DOB flags indicate existing customer with ID or email
          this.handleExistingCustomerWithIdOrEmail(combinedEntry, result);
        } else if (phoneNumberFlag === '1') {
          // Handle scenario where phone flag indicates existing customer with phone
          this.handleExistingCustomerWithPhone(combinedEntry, result);
        }
      });
    }
  }

  private handleNewCustomer(idType: any, refNum: any): void {
    this.readonly = true;
    this.toast.show(
      null,
      this.translate.instant('FORMS.DEDUPE.ERRORS.NEGATIVE_DEDUPE', {
        idType: this.translate.instant(idType.name),
        refNum: refNum,
      }),
      MessageBoxType.SUCCESS,
      5000,
      undefined,
      undefined,
      false
    );

    this.onFinished.emit({
      customerExists: false,
      idFormValue: this.dedupeForm.getRawValue(),
    });
  }

  private handleExistingCustomerWithPhone(entry: any, result: any): void {
    this.readonly = true;
    this.phoneflag = true;

    this.dedupeCifResults = result;

    this.toast.show(
      null,
      this.translate.instant('FORMS.DEDUPE.ERRORS.POSITIVE_DEDUPE_PHONE', {
        phone: `+${entry.phoneNumber}`,
      }),
      MessageBoxType.WARNING
    );

    this.customerId = entry?.cifNumber?.trim() || '';

    if (this.dedupeCifResults?.length === 1) {
      this.onFinished.emit({
        customerExists: false,
        idFormValue: this.dedupeForm.getRawValue(),
      });
    }
  }

  private handleExistingCustomerWithIdOrEmail(entry: any, result: any): void {
    this.readonly = true;

    this.dedupeCifResults = result;

    const messageKey =
      this.dedupeCifResults.length > 1
        ? 'FORMS.DEDUPE.ERRORS.POSITIVE_DEDUPE_MULTIPLE'
        : entry.emailAddressFlag === '1'
          ? 'FORMS.DEDUPE.ERRORS.POSITIVE_DEDUPE_EMAIL'
          : 'FORMS.DEDUPE.ERRORS.POSITIVE_DEDUPE';

    if (entry.emailAddressFlag === '1') {
      this.toast.show(
        null,
        this.translate.instant(messageKey, { email: `${entry.emailAddress}` }),
        MessageBoxType.WARNING
      );
    } else {
      this.toast.show(
        null,
        this.translate.instant(messageKey, {
          idType: entry.documentDescription,
          refNum: entry.documentNumber,
        }),
        MessageBoxType.WARNING
      );
    }

    this.customerId = entry?.cifNumber?.trim() || '';

    if (this.dedupeCifResults?.length === 1) {
      this.onFinished.emit({
        customerExists: true,
        idFormValue: this.dedupeForm.getRawValue(),
      });
    }
  }
}
