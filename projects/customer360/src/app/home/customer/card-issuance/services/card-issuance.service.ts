import { Injectable } from '@angular/core';
import { MessageBoxType, ToastService } from '@shared/modules/toast';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  AbstractControl,
  FormArray,
  UntypedFormBuilder,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CardIssuanceLocalStorageKeys } from '@app/home/customer/card-issuance/card-issuance.models';
import { SessionService } from '@shared/services';
import { CardIssuanceApisService } from '@app/home/customer/card-issuance/services/card-issuance-apis.service';

@Injectable({
  providedIn: 'root',
})
export class CardIssuanceService {
  BRANCHES = 'branches';
  constructor(
    private toastService: ToastService,
    protected fb: UntypedFormBuilder,
    private sessionService: SessionService,
    private cardIssuanceApiService: CardIssuanceApisService
  ) {}

  showErrorMessage(error: any) {
    const errorMessage =
      error?.statusMessage ||
      error?.error?.statusMessage ||
      'Something went wrong';
    this.toastService.show(
      '',
      errorMessage,
      MessageBoxType.DANGER,
      5000,
      undefined,
      undefined,
      false
    );
  }

  public callApi<T>(
    apiCall: Observable<T>,
    responseHandler: (isSuccess: boolean, data: T) => void
  ): void {
    apiCall
      .pipe(
        catchError(error => {
          this.handleError(error);
          throw error; // Rethrow the error for further handling if needed
        })
      )
      .subscribe({
        next: (response: any) => {
          if (response.successful) {
            responseHandler(true, response);
          } else {
            responseHandler(false, response);
            this.handleError(response);
          }
        },
        error: err => {
          responseHandler(false, err);
          this.handleError(err);
        },
      });
  }
  private handleError(error: any): void {
    this.showErrorMessage(error);
  }

  extractLastDigits(input: string, count: number): string {
    const digits = input.replace(/\D/g, ''); // Remove non-digit characters
    return digits.slice(-count); // Get the last 3 digits
  }

  initializeIssuanceForm() {
    //todo use issuance statics
    return this.fb.group({
      accountNumber: ['', [Validators.required]],
      accountName: ['', [Validators.required]],
      cardType: ['', [Validators.required]],
      activeActionFlow: ['', [Validators.required]],
      cardCurrency: ['', [Validators.required]],
      cardEmbossingName: ['', [Validators.required]],
      cardPAN: ['', [Validators.required]],
      cardPANValid: [''],
      withdrawalLimit: ['', [Validators.required]],
      ecommerceLimit: ['', [Validators.required]],
      taxAmount: ['', [Validators.required]],
      chargeAmount: ['', [Validators.required]],
      charges: ['', [Validators.required]],
      collectionBranch: [''],
      physicalPin: [''],
    });
  }

  initializeDocumentsForm() {
    return this.fb.group({
      documents: this.fb.array([], {
        validators: atLeastOneDocumentValidator(),
      }),
    });
  }

  pansToTestWith = [
    '4203450000615983',
    '1000000068080645',
    '1000000068071198',
    '4103820067473446',
    '5196010315941825',
    '5196010323650228',
    '5196010331358624',
    '5196010309627182',
  ];
  setItem(key: CardIssuanceLocalStorageKeys, value: any): void {
    localStorage.setItem(key as string, JSON.stringify(value));
  }

  // Method to get an item from local storage
  getItem(key: CardIssuanceLocalStorageKeys): any | null {
    const item = localStorage.getItem(key as string);
    return item ? JSON.parse(item) : null;
  }

  removeBase64Prefix(base64data: string): string {
    const base64PrefixRegex = /^data:[^;]+;base64,/;
    return base64data.replace(base64PrefixRegex, '');
  }

  resetItem(key: CardIssuanceLocalStorageKeys) {
    localStorage.removeItem(key as string);
  }

  convertListToDropdownFormat(list: any[], label: string, value: string) {
    const lists = list.map(listItem => ({
      value: listItem[value],
      label: listItem[label],
    }));
    return lists;
  }
  setupBranches(callback: (loading: boolean, branches?: any[]) => void) {
    const activeBank = this.getItem('UserBank');
    const bankBranches = this.getItem('Branches');
    const bankId = this.sessionService.userBank;
    if (!activeBank) {
      this.setItem('UserBank', bankId);
    }
    if (!bankBranches) {
      callback(true);
      this.cardIssuanceApiService.fetchBranches(bankId).subscribe({
        next: r => {
          callback(false, r);
          this.setItem('Branches', r);
        },
        error: r => {
          callback(false);
          this.setItem('Branches', r);
        },
      });
    } else {
      if (activeBank !== bankId) {
        this.cardIssuanceApiService.fetchBranches(bankId).subscribe({
          next: r => {
            callback(false, r);
            this.setItem('Branches', r);
          },
          error: r => {
            callback(false);
            this.setItem('Branches', r);
          },
        });
      } else {
        callback(false, bankBranches);
      }
    }
  }

  setupCardTypes(callback: (loading: boolean, cardTypes?: any[]) => void) {
    const activeBank = this.getItem('UserBank');
    const cardTypes = this.getItem('Card-Types');
    const bankId = this.sessionService.userBank;
    if (!activeBank) {
      this.setItem('UserBank', bankId);
    }
    if (!cardTypes) {
      callback(true);
      this.cardIssuanceApiService
        .getProductTypes({
          countryCode: this.sessionService.userCountryCode,
        })
        .subscribe({
          next: r => {
            callback(false, r.responseObject);
            this.setItem('Card-Types', r.responseObject);
          },
          error: r => {
            callback(false);
            this.setItem('Card-Types', r.responseObject);
          },
        });
    } else {
      if (activeBank !== bankId) {
        this.cardIssuanceApiService
          .getProductTypes({
            countryCode: this.sessionService.userCountryCode,
          })
          .subscribe({
            next: r => {
              callback(false, r.responseObject);
              this.setItem('Card-Types', r.responseObject);
            },
            error: r => {
              callback(false);
              this.setItem('Card-Types', r.responseObject);
            },
          });
      } else {
        callback(false, cardTypes);
      }
    }
  }
}

function atLeastOneDocumentValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const documents = control as FormArray;
    return documents.length > 0 ? null : { atLeastOneRequired: true };
  };
}
