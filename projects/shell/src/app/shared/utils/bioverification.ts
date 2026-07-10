import { MatDialog } from '@angular/material/dialog';
import { firstValueFrom, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';

type ActionTicketValidationMethod =
  | 'validateMandateDocuments'
  | 'validateMandateBioVerify';

export interface BioVerificationConfig {
  // Required parameters
  dialog: MatDialog;
  customerData: any;

  // Optional parameters with defaults
  isBusiness?: boolean;
  isCustomerPresent?: boolean;
  selectedAccount?: any;
  accounts?: any[];
  filteredAccounts?: any[];
  actionTicketsService?: ActionTicketsService;
  toastService?: ToastService;
  translateService?: TranslateService;
  router?: Router;

  // Process specific parameters
  ticketId?: string;
  actionFlow?: string;
  processName?: string;

  // Callback functions
  onSuccessCallback?: () => void;
  onErrorCallback?: (error: any) => void;

  // Additional options
  hideSkipBio?: boolean;
  inProcess?: boolean;
  customerId?: string;
  customerType?: string;
  bankId?: string;
}

export class BioVerificationUtil {
  /**
   * Handles the bio verification flow based on the provided configuration
   * @param config Configuration for bio verification
   * @returns Observable that completes when the bio verification process is done
   */
  static launchBio(config: BioVerificationConfig): Observable<any> {
    const {
      dialog,
      customerData,
      isBusiness = false,
      isCustomerPresent = true,
      selectedAccount,
      accounts = [],
      filteredAccounts = [],
      actionTicketsService,
      toastService,
      translateService,
      router,
      ticketId,
      actionFlow,
      onSuccessCallback,
      onErrorCallback,
      hideSkipBio = true,
      inProcess = true,
      processName = '',
    } = config;

    // If customer is not present and we have action tickets service, handle not present flow
    if (!isCustomerPresent && actionTicketsService && ticketId && actionFlow) {
      const notPresentPayload = { skipBio: true };

      return actionTicketsService
        .sendNotPresentBio(ticketId, actionFlow, notPresentPayload)
        .pipe(
          switchMap(response => {
            if (response?.successful) {
              return actionTicketsService.validateMandateBioVerify(
                ticketId,
                actionFlow
              );
            }
            return of({
              successful: false,
              statusMessage: 'Failed to send not present bio',
            });
          }),
          switchMap(response => {
            if (response.successful) {
              if (toastService && translateService) {
                toastService.show(
                  translateService.instant('TOAST.TITLE'),
                  translateService.instant('TOAST.SUCCESSFULLY'),
                  MessageBoxType.SUCCESS,
                  5000,
                  undefined,
                  undefined,
                  true
                );
              }

              if (onSuccessCallback) {
                onSuccessCallback();
              }

              if (router) {
                router.navigateByUrl('dashboard');
              }
            } else if (toastService) {
              toastService.show(
                translateService?.instant('TOAST.TITLE') || 'Error',
                response.statusMessage || 'An error occurred',
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );

              if (onErrorCallback) {
                onErrorCallback(response);
              }
            }
            return of(response);
          })
        );
    }

    // Determine which account to use
    const accountToUse =
      selectedAccount ||
      (accounts.length > 0 ? accounts[0] : null) ||
      (filteredAccounts.length > 0 ? filteredAccounts[0] : null);

    // Check if we need to use signatories dialog or direct bio verification
    if (accountToUse?.mandate !== 'SELF' && isCustomerPresent) {
      return this.openSignatoriesDialog(config, accountToUse);
    } else if (isCustomerPresent) {
      return this.openVerifyBioDialog(config, accountToUse);
    }

    return of({
      successful: false,
      statusMessage: 'Invalid configuration for bio verification',
    });
  }

  /**
   * Opens the signatories dialog for verification
   */
  private static openSignatoriesDialog(
    config: BioVerificationConfig,
    account: any
  ): Observable<any> {
    const {
      dialog,
      customerData,
      actionTicketsService,
      toastService,
      translateService,
      ticketId,
      actionFlow,
      onSuccessCallback,
      onErrorCallback,
      hideSkipBio = true,
      inProcess = true,
      processName = '',
    } = config;

    const result = 'canVerify';

    const dialogRef = dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        searchFlow: false,
        accepted: false,
        user: customerData,
        hideSkipBio: hideSkipBio,
        inProcess: inProcess,
        [processName ? processName : 'changeOfSignatories']: true,
      },
    });

    return new Observable(observer => {
      dialogRef.afterClosed().subscribe(result => {
        if (result && result.status === 'canVerify' && result.data) {
          this.openVerifySignatoryBioDialog(
            config,
            result.data,
            account
          ).subscribe(
            bioResult => observer.next(bioResult),
            error => observer.error(error),
            () => observer.complete()
          );
        } else {
          observer.next({ successful: false, skipped: true });
          observer.complete();
        }
      });
    });
  }

  /**
   * Opens the signatory bio dialog for verification
   */
  private static openVerifySignatoryBioDialog(
    config: BioVerificationConfig,
    signatories: any,
    account: any
  ): Observable<any> {
    const {
      dialog,
      customerData,
      actionTicketsService,
      toastService,
      translateService,
      ticketId,
      actionFlow,
      onSuccessCallback,
      onErrorCallback,
      hideSkipBio = true,
      inProcess = true,
      processName = '',
    } = config;

    const dialogRef = dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: false,
        user: customerData,
        hideSkipBio: hideSkipBio,
        signatories: signatories,
        inProcess: inProcess,
        [processName ? processName : 'changeOfSignatories']: true,
      },
    });

    return new Observable(observer => {
      dialogRef.afterClosed().subscribe(async result => {
        if (
          result &&
          result.data &&
          actionTicketsService &&
          ticketId &&
          actionFlow
        ) {
          try {
            const validationResponse = await firstValueFrom(
              actionTicketsService.validateMandateBioVerify(
                ticketId,
                actionFlow
              )
            );

            if (validationResponse.successful) {
              if (toastService && translateService) {
                toastService.show(
                  'Success',
                  translateService.instant(
                    'CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.ADDED-SUCCESS'
                  ),
                  MessageBoxType.SUCCESS,
                  5000,
                  undefined,
                  undefined,
                  false
                );
              }

              if (onSuccessCallback) {
                onSuccessCallback();
              }

              observer.next({ successful: true, data: result.data });
            } else {
              throw new Error(
                validationResponse.statusMessage || 'Validation failed'
              );
            }
          } catch (error) {
            if (toastService && translateService) {
              toastService.show(
                'Error',
                translateService.instant(
                  'CUSTOMER.ACCOUNT-SERVICES.CHANGE-OF-SIGNATORY.ADDED-FAIL'
                ),
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
            }

            if (onErrorCallback) {
              onErrorCallback(error);
            }

            observer.error(error);
          }
        } else {
          observer.next({ successful: false, skipped: true });
        }
        observer.complete();
      });
    });
  }

  /**
   * Opens the bio verification dialog
   */
  private static openVerifyBioDialog(
    config: BioVerificationConfig,
    account: any
  ): Observable<any> {
    const {
      dialog,
      customerData,
      actionTicketsService,
      toastService,
      translateService,
      ticketId,
      actionFlow,
      onSuccessCallback,
      onErrorCallback,
      hideSkipBio = true,
      inProcess = true,
      processName = '',
    } = config;

    const dialogRef = dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: false,
        user: customerData,
        hideSkipBio: hideSkipBio,
        inProcess: inProcess,
        [processName ? processName : 'changeOfSignatories']: true,
        ticketId: ticketId,
      },
    });

    return new Observable(observer => {
      dialogRef.afterClosed().subscribe(async result => {
        if (
          result &&
          result.data &&
          actionTicketsService &&
          ticketId &&
          actionFlow
        ) {
          try {
            // For mandate processes, use validateMandateDocuments
            // let validationMethod = actionFlow.toLowerCase().includes('mandate')
            //   ? 'validateMandateDocuments'
            //   : 'validateMandateBioVerify';
            const validationMethod: ActionTicketValidationMethod = actionFlow
              .toLowerCase()
              .includes('mandate')
              ? 'validateMandateDocuments'
              : 'validateMandateBioVerify';
            const validationResponse = await (
              actionTicketsService[validationMethod] as Function
            )(ticketId, actionFlow).toPromise();

            if (validationResponse.successful) {
              if (toastService) {
                toastService.show(
                  'Success',
                  'Bio verification successful',
                  MessageBoxType.SUCCESS,
                  5000,
                  undefined,
                  undefined,
                  false
                );
              }

              if (onSuccessCallback) {
                onSuccessCallback();
              }

              observer.next({ successful: true, data: result.data });
            } else {
              throw new Error(
                validationResponse.statusMessage || 'Validation failed'
              );
            }
          } catch (error) {
            if (toastService) {
              toastService.show(
                'Error',
                'Failed to validate bio verification',
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
            }

            if (onErrorCallback) {
              onErrorCallback(error);
            }

            observer.error(error);
          }
        } else {
          observer.next({ successful: false, skipped: true });
        }
        observer.complete();
      });
    });
  }
}
