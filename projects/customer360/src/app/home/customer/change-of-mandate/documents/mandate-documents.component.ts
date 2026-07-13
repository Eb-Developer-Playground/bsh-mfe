import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  MatDialog,
} from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Subject, take, takeUntil } from 'rxjs';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import {
  OnActive,
  OnSave,
  StepperChildComponent,
} from '@app/shared/modules/stepper';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { AccountService } from '@app/core/services/account/account.service';
import {
  IDocumentSpec,
  IUploadedDocument,
} from '@app/shared/modules/upload-docs';
import {
  BioVerifyInput,
  FingerprintsService,
} from '@app/shared/modules/fingerprints';
import { SessionService } from '@app/shared/services';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { CommonModule } from '@angular/common';
import { DocumentsUploadComponent } from '@app/shared/modules/upload-docs';
import { DocumentsUploadDrcComponent } from '@app/shared/modules/upload-docs/documents-upload-drc/documents-upload-drc.component';

@Component({
  selector: 'app-mandate-documents',
  templateUrl: './mandate-documents.component.html',
  styleUrls: ['./mandate-documents.component.scss'],
  imports: [
    CommonModule,
    DocumentsUploadComponent,
    DocumentsUploadDrcComponent,
  ],
})
export class MandateDocumentsComponent
  extends StepperChildComponent
  implements OnInit, OnActive, OnDestroy, OnSave
{
  requiredDocs!: IDocumentSpec[];
  uploadedDocs!: IUploadedDocument[];
  cloneOfObjects: Array<any> = [];

  fingerprintAccepted: boolean = false;
  private customer!: any;
  private ticketId!: string;
  private destroy$ = new Subject();
  accountType!: string;
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  accounts: any = JSON.parse(<string>localStorage.getItem('accounts'));
  relatedAccounts: any = JSON.parse(
    <string>localStorage.getItem('relatedAccounts')
  );
  filteredAccount: any;
  filteredAccounts: any = [];
  isPresent!: boolean;
  isBusiness!: boolean;
  customerCifData = JSON.parse(<string>localStorage.getItem('customerCifData'));
  account: any;
  subsidiary!: ISubsidiary;
  useChangeMandateFlowV2!: boolean;

  constructor(
    public translateService: TranslateService,
    public dialog: MatDialog,
    private toastService: ToastService,
    private changeMandateService: ChangeMandateService,
    private router: Router,
    private accountService: AccountService,
    private bioService: FingerprintsService,
    private sessionService: SessionService,
    private actionTicketsService: ActionTicketsService
  ) {
    super();
    this.useChangeMandateFlowV2 = this.changeMandateService.useChangeMandateFlowV2(this.sessionService.subsidiary.countryCode);
  }

  ngOnInit(): void {
    this.subsidiary = this.sessionService.subsidiary;
    localStorage.removeItem('documentOnActive');
  }

  onActive(): void {
    let accountType: any = localStorage.getItem('accountType');
    if (!accountType) {
      const isBusiness = localStorage.getItem('isBusiness') === 'true';
      const selectedAccount = JSON.parse(localStorage.getItem('selectedAccount') || '{}');
      accountType = isBusiness ? 'entity' : (selectedAccount.mandate !== 'SELF' ? 'joint' : 'individual');
      localStorage.setItem('accountType', accountType);
    }
    this.accountType = accountType;
    const docs: IDocumentSpec[] = [];

    if (!this.useChangeMandateFlowV2) {
      docs.push({
        name: 'Change of Mandate Form',
        description: 'Change of Mandate Application Form',
        maxSize: 1024 * 1024,
        required: true,
        docCode: '034',
      });
    }


    if (this.useChangeMandateFlowV2) {

        const runningTaskId = localStorage.getItem('runningTaskId');
        const runningActionFlow = localStorage.getItem('runningActionFlow');

      if (runningTaskId && runningActionFlow) {

        if (this.subsidiary.countryCode === 'RW' || this.subsidiary.countryCode === 'UG') {
          if (this.subsidiary.countryCode === 'RW') {
            this.actionTicketsService
              .getListOfDocumentsPartial(runningTaskId, runningActionFlow)
              .pipe(take(1))
              .subscribe({
                next: response => {
                },
                error: () => {
                  this.toastService.show(
                    'Error',
                    'Unable to retrieve documents at this time.',
                    MessageBoxType.DANGER,
                    5000,
                    undefined,
                    undefined,
                    false
                  );
                }
              });
          }

          if (accountType === 'joint') {
            if (this.subsidiary.countryCode === 'UG') {
              docs.push({
                name: 'Change of Mandate Form',
                description: 'Change of Mandate Application Form',
                maxSize: 1024 * 1024,
                required: true,
                docCode: '034',
              });
            } else {
              docs.push(
                {
                  name: 'Application Letter',
                  description: 'Application Letter',
                  maxSize: 1024 * 1024,
                  required: true,
                  docCode: '020'
                },
                {
                  name: 'Signed Form',
                  description: 'Signed Form',
                  maxSize: 1024 * 1024,
                  required: true,
                  docCode: '001'
                },
                {
                  name: 'Copy of ID',
                  description: 'Copy of ID',
                  maxSize: 1024 * 1024,
                  required: true,
                  docCode: '005'
                },
                {
                  name: 'Passport',
                  description: 'Passport',
                  maxSize: 1024 * 1024,
                  required: false,
                  docCode: '004'
                }
              );
            }
          } else if (accountType === 'entity') {
            docs.push(
              {
                name: 'Board Resolution',
                description: 'Board Resolution',
                maxSize: 1024 * 1024,
                required: true,
                docCode: '025',
              },
              {
                name: 'Meeting Minutes',
                description: 'Meeting Minutes',
                maxSize: 1024 * 1024,
                required: true,
                docCode: '021',
              }
            );
          }
        } else {
          this.actionTicketsService
            .getListOfDocumentsPartial(runningTaskId, runningActionFlow).pipe(
              take(1)
          )
            .subscribe({
              next:   (response: any) => {
                if (response.responseObject) {
                  const documents = response.responseObject.documents || response.responseObject.DocumentData?.Documents;
                  if (documents) {
                    documents.forEach(
                      (doc: any) => {
                        docs.push({
                          name: doc.fileName || doc.FileName,
                          description: doc.description || doc.Description,
                          maxSize: 1024 * 1024,
                          required: doc.required || doc.Required,
                          docCode: doc.documentCode || doc.DocumentCode,
                          fileTypes: doc.fileExtensions?.map((ext: string) =>
                            ext === 'pdf' ? 'application/pdf' : `image/${ext}`
                          ) || ['image/png', 'image/jpeg', 'application/pdf'],
                        });
                      }
                    );
                  } else {
                  }
                }
              },
              error: () => {
                this.toastService.show(
                  'Error',
                  'Unable to retrieve documents at this time.',
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
      docs.push({
        name: this.translateService.instant(
          'DOCUMENTS.CUSTOMER-INSTRUCTION-FORM'
        ),
        description: this.translateService.instant(
          'DOCUMENTS.CUSTOMER-INSTRUCTION-FORM'
        ),
        maxSize: 1024 * 1024,
        required: false,
        docCode: '059',
      });
    }

    if (!this.useChangeMandateFlowV2) {
      switch (accountType) {
        case 'entity':
          docs.push({
            name: 'Board Resolution',
            description: 'Board Resolution',
            maxSize: 1024 * 1024,
            required: true,
            docCode: '025',
          });
          break;
        case 'joint':
          docs.push({
            name: 'Change of Mandate Letter',
            description: 'Change of Mandate Letter',
            maxSize: 1024 * 1024,
            required: true,
            docCode: '105',
          });
          break;
      }
    }

    this.requiredDocs = docs;

    const unfilteredAccounts: any = this.accounts.filter(
      (account: any) => account.schemeType !== 'LAA'
    );
    const combinedAccounts = [...unfilteredAccounts, ...this.relatedAccounts];
    this.filteredAccounts = combinedAccounts.filter(
      (account: any) => account.accountStatus === 'A'
    );
    const account: any = localStorage.getItem('accMgntObj');
    this.account = JSON.parse(account);
    const customer: any = localStorage.getItem('selectedAccount');
    this.customer = JSON.parse(customer);
    this.isPresent = this.customer.isPresent;
    this.ticketId = JSON.parse(<string>localStorage.getItem('ticketId'));
    this.isBusiness = JSON.parse(<string>localStorage.getItem('isBusiness'));

    this.updateDocuments(this.uploadedDocs);
  }

  updateDocuments(docs: IUploadedDocument[]) {
    this.uploadedDocs = docs;
    const isFormValid =
      this.useChangeMandateFlowV2 ||
      this.uploadedDocs.every(d => d.file && (d.required ? d.file : true));
    this.stepControl.patchValue(isFormValid ? true : null);
  }

  onSave() {
    const runningActionFlow = localStorage.getItem('runningActionFlow');
    const runningTaskId = localStorage.getItem('runningTaskId');

    let newgenUploads: any[] = [];
    this.uploadedDocs.forEach(doc => {
      if (doc.document.data) {
        newgenUploads.push({
          ...doc?.document,
          filename: doc.name,
          DocCode: doc.docCode?.toString().padStart(3, '0'),
        });
      }
    });
    newgenUploads.forEach(docs => (docs.data = docs.data?.split(',')[1]));

    if (newgenUploads.length === 0) {
      if (this.useChangeMandateFlowV2) {
        this.toastService.show(
          `Success!`,
          `No mandatory documents required !`,
          MessageBoxType.SUCCESS
        );
        this.gotoNext();
      }
      return;
    }

    let data;
    if (this.account.isPresent) {
      data = {
        processName: 'Customer Onboarding',
        processId: this.customer.cif,
        AccountNumber: this.customer.accountNumber,
        CIF: this.customer.cif,
        branch: this.sessionService.user?.branchid,
        Country: this.sessionService.subsidiary.countryCode,
        ticketNumber: runningTaskId,
        idType: this.account.idType,
        idNumber: this.account.idNumber,
        Service: 'NewGen',
        documents: newgenUploads,
      };
    } else {
      data = {
        processName: 'Customer Onboarding',
        processId: this.account.cif,
        AccountNumber: this.account.accountNumber,
        CIF: this.account.cif,
        branch: this.sessionService.user?.branchid,
        Country: this.sessionService.subsidiary.countryCode,
        ticketNumber: runningTaskId,
        idType: this.account.idType,
        idNumber: this.account.idNumber,
        Service: 'NewGen',
        documents: newgenUploads,
      };
    }

    this.changeMandateService.uploadTransactionDocumentsV3(data)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
        next :docRes => {
        if (docRes.successful && docRes.responseObject) {
          const docs = docRes.responseObject;
          const isErrorFile = docs.some((doc: any) => !doc.success);
          if (isErrorFile) {
            docs.forEach((doc: any) => {
              if (!doc.success) {
                this.toastService.show(
                  'Error',
                  `Failed to upload ${doc.filename}. Reason: ${doc.message}`,
                  MessageBoxType.DANGER,
                  5000,
                  undefined,
                  undefined,
                  false
                );
              }
            });
            return;
          }
          if (docRes.successful) {
            if (this.useChangeMandateFlowV2) {
              localStorage.setItem(
                'uploadedDocuments',
                JSON.stringify(docRes.responseObject)
              );

              this.toastService.show(
                `Success!`,
                `Documents submitted to ticket successfully!`,
                MessageBoxType.SUCCESS,
                5000,
                undefined,
                undefined,
                false
              );
              if (this.subsidiary.countryCode === 'RW') {
                this.gotoNext();
              } else if (runningTaskId && runningActionFlow) {
                this.actionTicketsService.validateMandateDocuments(runningTaskId, runningActionFlow)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => {
                      this.gotoNext();
                    },
                    error: () => {
                      this.toastService.show(
                        'Error',
                        'Failed to validate mandate documents after upload. Please try again.',
                        MessageBoxType.DANGER,
                        5000,
                        undefined,
                        undefined,
                        false
                      );
                    },
                  });
              } else {
                this.gotoNext();
              }
            } else {
              this.toastService.show(
                `Success!`,
                `Documents submitted to ticket successfully!`,
                MessageBoxType.SUCCESS,
                5000,
                undefined,
                undefined,
                false
              );
              if (this.isPresent) {
                this.launchBio();
              } else {
                this.toastService.show(
                  `Change of Mandate`,
                  `Ticket submitted to Checker`,
                  MessageBoxType.SUCCESS,
                  5000,
                  undefined,
                  undefined,
                  false
                );
                this.router.navigateByUrl('/dashboard');
              }
            }
          }
        }
      },
        error: () => {
          this.toastService.show(
            'Error',
            'Documents upload failed. Please try again.',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
    }

    );
  }

  openVerifyBioDialog(event?: any): void {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '50%',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        changeOfMandate: true,
        ticketId: this.ticketId,
      },
    });

    dialogRef.afterClosed().pipe(
        takeUntil(this.destroy$)
    ).subscribe(result => {
      if (result) {
        this.fingerprintAccepted = result.data;
        this.clearAccountInquiryCache();
        this.gotoNext();
      }
    });
  }

  launchBio(): void {
    const result = 'canVerify';
    let ticket = JSON.parse(<string>localStorage.getItem('ticketId'));
    let selectedAccount = JSON.parse(
      <string>localStorage.getItem('selectedAccount')
    );
    let filteredAccount = this.filteredAccounts.filter(
      (account: any) => account.accountNumber === selectedAccount
    );
    this.customerData.accounts = filteredAccount;
    let payload: BioVerifyInput = {
      account: filteredAccount[0],
      skipBio: true,
      inProcess: true,
      customerId: this.customer.customerId,
      customerType: 'Individual',
      fullName: `${this.customerData.firstName || ''} ${this.customerData.lastName || ''}`,
      bankId: this.customerData?.bankID,
    };
    if (filteredAccount[0]?.mandate !== 'SELF' || this.isBusiness) {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBioDialog();
    }
  }

  openSignatoriesDialog(data: any) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        searchFlow: false,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        inProcess: true,
        changeOfMandate: true,
      },
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (data === 'canVerify' && result.data && result.status === data)
        return this.openVerifySignatoryBioDialog(result.data);
      if (data === 'canNotVerify' && result.status === data) {
        return this.openSkipBioDialog();
      }
      if (data === 'knownCannotVerify' && result.status === data) {
        return this.openSkipBioDialog(data);
      }
    });
  }

  openVerifySignatoryBioDialog(signatories: any) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        signatories: signatories,
        changeOfMandate: true,
        inProcess: true,
      },
    });

    dialogRef.afterClosed()
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      if (result) {
        if (
          window.location.hostname !==
            'branchservicehub-customer-360-dev.azurewebsites.net' &&
          window.location.hostname !== 'localhost'
        ) {
          this.clearAccountInquiryCache();
        }

        this.fingerprintAccepted = result.data;
       this.toastService.show(
                            this.translateService.instant('TOAST.ACTION-SUCCESSFULLY'), '', MessageBoxType.SUCCESS,
                            5000, undefined, undefined, false
                        );
        this.gotoNext();
      }
    });
  }

  openSkipBioDialog(event?: string) {
    const user = this.customerData;
    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        user: event ? user : '',
        headerText: event ? 'Known agent verification' : 'Skip Biometric',
        subHeaderText: event
          ? 'Requirements for known agent verification'
          : 'Requirements for bio-override',
      },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.destroy$))
    .subscribe(result => {});
  }

  clearAccountInquiryCache() {
    this.accountService
      .clearAccountInquiryCache(
        `?Id=${this.customer.cif}&bankId=${this.customer.bankID}&idType=customerid`
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe((v: any) => {});
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
