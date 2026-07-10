import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ChequeIssuanceDetailsPreviewComponent } from '@app/home/customer/cheque-requests/cheque-issuance-details-preview/cheque-issuance-details-preview.component';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { v4 as uuid } from 'uuid';
import { ContextManager } from '@shared/modules/stepper';
import { BioVerificationUtil, BioVerificationConfig } from '@app/shared/utils/bioverification';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChequeOperationsService {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toast = inject(ToastService);
  private actionTicketsService = inject(ActionTicketsService);
  private ctxManager = inject(ContextManager);

  private runningTaskId: string = '';
  private runningActionFlow: string = '';

  issueCheque(selectedCheque: any, selectedAccount: any, isBusiness: boolean, accountData: any): void {
    if (!selectedCheque) {
      return;
    }
    localStorage.setItem('selectedCheque', JSON.stringify(selectedCheque));

    const dialogRef = this.dialog.open(ChequeIssuanceDetailsPreviewComponent, {
      width: '1000px', 
      panelClass: 'cheque-preview-dialog',
      data: { 
        selectedCheque, 
        selectedAccount 
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.processChequeIssuance(selectedCheque, selectedAccount, isBusiness, accountData);
      }
    });
  }

  stopCheque(selectedCheque: any): void {
    if (!selectedCheque) {
      return;
    }
    
    localStorage.setItem('selectedCheque', JSON.stringify(selectedCheque));
    this.router.navigateByUrl("/services/cheque-requests/stop-cheque", {});
  }

  private processChequeIssuance(cheque: any, accountDetails: any, isBusiness: boolean, accountData: any): void {
    // Create action ticket first
    const ticketPayload = {
      ActionFlow: 'IssueChequeBookFlow',
      TaskType: 'IssueChequeBook',
      AssociatedId: uuid(),
    };
  
    this.actionTicketsService.createActionTicket(ticketPayload).subscribe({
      next: (response) => {
        if (response.successful) {
          this.runningTaskId = response.responseObject.ticketId;
          this.runningActionFlow = response.responseObject.actionFlowName;
          
          localStorage.setItem('ticket', JSON.stringify(response.responseObject));
          
          const customerDetails = JSON.parse(localStorage.getItem('customerDetails') || '{}');
          const selectedAccountDetails = customerDetails?.accounts?.find(
            (account: any) => account.accountNumber === accountDetails.accountNumber
          );
          const schemeCode = selectedAccountDetails?.schemeCode || '';
          
          const mandatePayload = {
            AccountDetails: {
              SchemeCode: schemeCode
            },
            CustomerDetails: {
              AccountId: accountDetails.accountNumber,
              CustomerId: accountDetails.cif
            },
            ChequeBookOrderDetails: {
              RequestId: cheque.requestId || cheque.refNo,
            },
            ChequeDetails: cheque,
            IsCustomerPresent: accountData.isPresent,
            IsBusiness: isBusiness
          };

          // Save CustomerDetails in localStorage
          localStorage.setItem(
            'ChequeDetails',
            JSON.stringify({
              ChequeId: cheque.requestId,
              CustomerDetails: accountDetails,
            })
          );
        
          // Set ticket details
          this.actionTicketsService.createActionTicketWithDetails(
            this.runningTaskId, 
            this.runningActionFlow, 
            mandatePayload
          ).subscribe({
            next: () => {
              // Proceed with cheque issuance
                this.actionTicketsService.validateMandateTicket(this.runningTaskId, this.runningActionFlow).subscribe({
                  next: () => {
                    this.actionTicketsService.ChequeOrderStatusValidation(this.runningTaskId, this.runningActionFlow).subscribe({
                      next: (response) => {
                        this.launchBioVerification(cheque, accountDetails, isBusiness, accountData);
                        // this.toast.show(
                        //   null, 
                        //   'Cheque issued successfully', 
                        //   MessageBoxType.SUCCESS, 
                        //   5000, 
                        //   undefined, 
                        //   undefined, 
                        //   false
                        // );
                      },
                      error: (error) => {
                        // this.toast.show(
                        //   null, 
                        //   'Failed to issue cheque', 
                        //   MessageBoxType.DANGER, 
                        //   5000, 
                        //   undefined, 
                        //   undefined, 
                        //   false
                        // );
                      }
                    });
                  },
                  error: (error) => {
                    // this.toast.show(
                    //   null, 
                    //   'Failed to validate mandate ticket', 
                    //   MessageBoxType.DANGER, 
                    //   5000, 
                    //   undefined, 
                    //   undefined, 
                    //   false
                    // );
                  }
                });
            },
            error: (error) => {
              console.error('Error setting ticket details:', error);
              this.toast.show(
                null, 
                'Failed to set ticket details', 
                MessageBoxType.DANGER, 
                5000, 
                undefined, 
                undefined, 
                false
              );
            }
          });
        } else {
          this.toast.show(
            null, 
            response?.statusMessage || 'Action ticket creation failed', 
            MessageBoxType.DANGER, 
            5000, 
            undefined, 
            undefined, 
            false
          );
        }
      },
      error: (error) => {
        this.toast.show(
          null, 
          'Failed to create action ticket', 
          MessageBoxType.DANGER, 
          5000, 
          undefined, 
          undefined, 
          false
        );
      }
    });
  }

  private launchBioVerification(cheque: any, accountDetails: any, isBusiness: boolean, accountData: any): void {
    // Get customer data from localStorage or other source
    const customerData = JSON.parse(localStorage.getItem('customerDetails') || '{}');
    const accounts = JSON.parse(localStorage.getItem('accounts') || '{}');
    const selectedAccount = this.ctxManager.contextData?.['chequebook_request']?.selectedAccount;
    const filteredAccount = accounts.find(
      (account: any) => account.accountNumber === accountDetails?.accountNumber
    );
    
    if (selectedAccount && Array.isArray(customerData.accounts)) {
      const filteredAccounts = customerData.accounts.filter(
        (account: any) => account.accountNumber === selectedAccount.accountNumber
      );
      customerData.accounts = filteredAccounts.length > 0 ? [filteredAccounts[0]] : [];
    }

    localStorage.setItem('selectedAccount', JSON.stringify(filteredAccount));
    
    
    const config: BioVerificationConfig = {
      dialog: this.dialog,
      customerData: customerData,
      isBusiness: isBusiness,
      isCustomerPresent: accountData.isPresent,
      selectedAccount: filteredAccount,
      actionTicketsService: this.actionTicketsService,
      toastService: this.toast,
      translateService: undefined, // You need to inject TranslateService in the constructor
      ticketId: this.runningTaskId,
      actionFlow: this.runningActionFlow,
      processName: 'Customer Onboarding',
      onSuccessCallback: () => {
        // Handle success - refresh the list if needed
        
        // Show success message
        this.toast.show(
          null, 
          'Cheque issued successfully', 
          MessageBoxType.SUCCESS, 
          5000, 
          undefined, 
          undefined, 
          false
        );
      },
      onErrorCallback: (error) => {
        console.error('Error in bio verification:', error);
        this.toast.show(
          null, 
          'Failed to complete bio verification', 
          MessageBoxType.DANGER, 
          5000, 
          undefined, 
          undefined, 
          false
        );
      }
    };
  
    // Launch the bio verification process and subscribe to the result
    BioVerificationUtil.launchBio(config).subscribe({
      next: (result) => {
        if (result.successful) {
          this.router.navigateByUrl(
            "/services/cheque-requests/success-issue",
            {}
          );
        } else if (result.skipped) {
          // Handle skipped case if needed
        }
      },
      error: (error) => {
        console.error('Bio verification failed:', error);
        this.toast.show(
          null, 
          'Bio verification failed', 
          MessageBoxType.DANGER, 
          5000, 
          undefined, 
          undefined, 
          false
        );
      }
    });
  }
  
}
