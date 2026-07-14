import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subject,
  forkJoin,
  of,
  shareReplay,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { AccountService } from '@app/core/services/account/account.service';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import {
  AgentFormAreValid,
  AgentFormObj,
  FormNames,
} from '@app/shared/models';
import { IAccMgntObj } from '@app/shared/models/common';
import { CurrentFlowsOptions } from '@app/shared/models/common/accMgntObj.model';
import { CifInquiryObject } from '@app/shared/models/common/cifinquiry.model';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { GenderPipe } from '@app/shared/pipes/gender.pipe';
import { MaritalStatusPipe } from '@app/shared/pipes/marital-status.pipe';
import { TransformEmailPipe } from '@app/shared/pipes/transform-email.pipe';
import { TransformPhoneNumberPipe } from '@app/shared/pipes/transform-phone-number.pipe';
import { ApiService, SessionService } from '@app/shared/services';
import { BioVerifyService } from '@app/shared/services/bioVerifyStatus.service';
import { v4 as uuid } from 'uuid';
import {
  AgentForm,
  IKnownAgent,
  IKnownAgentFunctions,
} from '../models/known-agent.models';
import { KnownAgentService } from '../services/known.agent.service';
import { MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { LegacyCustomerImageComponent } from '@app/shared/components/legacy-customer-image/legacy-customer-image.component';
import { DocumentsReviewComponent } from '@app/shared/modules/upload-docs/review/documents-review.component';
import { DocumentsUploadComponent } from '@app/shared/modules/upload-docs/documents-upload.component';
import { KnownAgentEditFunctionsComponent } from '../known-agent-edit-functions/known-agent-edit-functions.component';
import { KnownAgentLimitsComponent } from '../known-agent-limits/known-agent-limits.component';


@Component({
  selector: 'app-known-agent-amend-functions',
  templateUrl: './known-agent-amend-functions.component.html',
  styleUrls: ['./known-agent-amend-functions.component.scss'],
  imports: [
    CommonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    MatButtonModule,
    TranslatePipe,
    LegacyCustomerImageComponent,
    DocumentsReviewComponent,
    DocumentsUploadComponent,
    KnownAgentEditFunctionsComponent,
    KnownAgentLimitsComponent,
  ],
})
export class KnownAgentAmendFunctionsComponent implements OnInit, OnDestroy {
  supportDocuments: any;
  customerId!: string;
  agentCustomerData!: CifInquiryObject;
  agentDisplayDataArray: { label: string; value: string | undefined }[] = [];
  agentDisplayDataAdditionalArray: {
    label: string;
    value: string | undefined;
  }[] = [];
  agentData!: IKnownAgent;
  formValues: AgentForm = {};
  AreValid: AgentFormAreValid = {
    functions: false,
    additionalInformation: true,
  };

  showAgentLimits = false;
  hideRemoveButton = false;
  valid = false;
  limit = '';
  documents!: Array<any>;
  functionsArray: IKnownAgentFunctions[] = [];
  documentsConfig: Array<any> = [];
  amend = true;
  isCustomerPresent = false;
  countryCode: string='';
  maritalStatus: string = '';
  countryOfResidence: string = '';
  nationality: string = '';
  region: string = '';
  placeOfBirth: string = '';
  deleted: boolean = false;

  private ticket: any;
  private fingerprintAccepted = false;

  private accMgntObj: IAccMgntObj = JSON.parse(
    <string>localStorage.getItem('accMgntObj')
  );
  private customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );

  private assignedFunctionsObject: any = {};

  private destroy$ = new Subject<void>();

  constructor(
    private translateService: TranslateService,
    private toastService: ToastService,
    public dialog: MatDialog,
    private router: Router,
    private sessionService: SessionService,
    private bioVerifyService: BioVerifyService,
    private knownAgentService: KnownAgentService,
    private accountService: AccountService,
    private route: ActivatedRoute,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.countryCode=this.sessionService.subsidiary.countryCode
    this.isCustomerPresent =
      this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT;

    this.amend = this.router.url.includes('amend');

  const accMgntObj = JSON.parse(localStorage.getItem('accMgntObj') || '{}');

  this.hideRemoveButton = 
    accMgntObj?.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT && 
    accMgntObj?.action === 'AddKnownAgent';

    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['id']) {
        const cif = params['id'];
        this.customerId = cif;

        this.getAgent(cif);
      }
    });

    if (!this.accMgntObj || !this.accMgntObj.accountsId) {
      this.toastService.show(
        'Error',
        'Account information not found',
        MessageBoxType.DANGER,
        5000, undefined, undefined, false
      );
      this.router.navigateByUrl('/services');
      return;
    }

    const agentId = this.route.snapshot?.params?.['id'];
    if (agentId) {
      this.getAgentById(agentId);
    } else {
      this.router.navigateByUrl('/services/known-agent');
    }

    this.knownAgentService.selectedAgentSubject$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.agentData = data;
          if (this.agentData?.deleted==='Y'){
            this.deleted=true;
          }else{
            this.deleted=false;
          }

          if (this.agentData?.ticketId) {
            this.getDocuments(this.agentData.ticketId);
          }
        }
      });
  }

  getAgent(cif: string) {
    const cifInquiryData = {
      bankId: this.sessionService.userBank,
      customerId: cif,
    };
    this.accountService
      .cifInquiryV2(false, cifInquiryData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(agentCustomerData => {
        this.agentCustomerData = agentCustomerData?.responseObject;
        this.setAgentData();
        this.getfunctions();
      });
  }

  getAgentById(agentId: string) {
    this.accountService.getKnownAgents(this.accMgntObj.accountsId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(agents => {
        if (agents?.responseObject && Array.isArray(agents.responseObject)) {
          const agent = agents.responseObject.find((agent: any) => agent.custId === agentId);
          if (agent) {
            this.agentData = agent;
            if (!this.agentData.acctNum) {
              this.agentData.acctNum = this.accMgntObj.accountsId;
            }
          }
        }
      });
  }
  

  getDocuments(ticketNumber: string) {
    const newgenRequest = {
      ticketNumber,
      service: 'Newgen',
      Cif: '',
    };
    
    const blobRequest = {
      ticketNumber,
      service: 'Blob',
      Cif: '',
    };
  
    forkJoin({
      newgen: this.api.post<any>('/v2/documents/search', newgenRequest),
      blob: this.api.post<any>('/v2/documents/search', blobRequest)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe(result => {
      const newgenDocs = result.newgen.responseObject || [];
      const blobDocs = result.blob.responseObject || [];
      
      this.supportDocuments = [...newgenDocs, ...blobDocs];
    });
  }
  

  private setAgentData() {
    this.maritalStatus = this.agentCustomerData.personalDetails?.maritalStatus
      ? (new MaritalStatusPipe().transform(
          this.agentCustomerData.personalDetails.maritalStatus
        ) as string)
      : '';
    const gender = this.agentCustomerData.personalDetails?.gender
      ? (new GenderPipe().transform(
          this.agentCustomerData.personalDetails?.gender
        ) as string)
      : '';

    const rawDate = this.agentCustomerData.personalDetails?.birthDate;
    const birthDate = rawDate
      ? new Date(rawDate).toISOString().split('T')[0]
      : '';

    this.agentDisplayDataArray = [
      {
        label: 'COMMON.NATIONALITY',
        value: this.agentCustomerData.personalDetails?.nationality,
      },
      {
        label: 'COMMON.COUNTRY-OF-RESIDENCE',
        value: this.agentCustomerData.personalDetails?.countryOfResidence,
      },
      {
        label: 'KNOWN-AGENT.ID-TYPE',
        value: this.agentCustomerData.personalDetails?.idType,
      },
      {
        label: 'KNOWN-AGENT.ID-NUMBER',
        value: this.agentCustomerData.personalDetails?.idNumber,
      },
      {
        label: 'KNOWN-AGENT.FIRST-NAME',
        value: this.agentCustomerData.personalDetails?.firstName,
      },
      // { label: 'KNOWN-AGENT.MIDDLE-NAME', value: this.agentCustomerData.personalDetails?.middleName },
      {
        label: 'KNOWN-AGENT.LAST-NAME',
        value: this.agentCustomerData.personalDetails?.lastName,
      },
      { label: 'KNOWN-AGENT.DATE-BIRTH', value: birthDate },
      {
        label: 'KNOWN-AGENT.CIF',
        value: this.agentCustomerData.personalDetails?.customerId,
      },
      {
        label: 'KNOWN-AGENT.ID-TYPE',
        value: this.agentCustomerData.personalDetails?.idType,
      },
      {
        label: 'KNOWN-AGENT.ID-NUMBER',
        value: this.agentCustomerData.personalDetails?.idNumber,
      },
      {
        label: 'KNOWN-AGENT.ID-SERIAL-NUMBER',
        value: this.agentCustomerData.personalDetails?.idSerialNumber,
      },
      {
        label: 'KNOWN-AGENT.KRA-PIN',
        value: this.agentCustomerData.personalDetails?.krapInNumber,
      },
      { label: 'COMMON.GENDER', value: gender },
      { label: 'COMMON.MARITAL-STATUS', value: this.maritalStatus },
    
    ];

    this.loadLookupData('nationalities', this.agentCustomerData?.personalDetails?.nationality);
    this.loadLookupData('drcregions', this.agentCustomerData?.personalDetails?.region, 'region');
    this.loadLookupData('drcregions', this.agentCustomerData?.personalDetails?.placeOfBirth, 'placeOfBirth');



    const primaryPhoneNumber = new TransformPhoneNumberPipe().transform(
      this.agentCustomerData.contactDetails.phoneNumbers,
      'PRIMARY'
    );
    const primaryEmailAddress = new TransformEmailPipe().transform(
      this.agentCustomerData.contactDetails.emailAddresses,
      'PRIMARY'
    );
    // const secondaryPhoneNumber = new TransformPhoneNumberPipe().transform(this.agentCustomerData.contactDetails.phoneNumbers, 'SECONDARY');
    // const secondaryEmailAddress = new TransformEmailPipe().transform(this.agentCustomerData.contactDetails.emailAddresses, 'SECONDARY');

    this.agentDisplayDataAdditionalArray = [
      { label: 'COMMON.PRIMARY-PHONE-NUMBER', value: primaryPhoneNumber },
      // { label: 'ADDITIONAL-INFORMATION.SECONDARY-PHONE-NUMBER', value: secondaryPhoneNumber },
      { label: 'COMMON.PRIMARY-EMAIL-ADDRESS', value: primaryEmailAddress },
      //{ label: 'ADDITIONAL-INFORMATION.SECONDARY-EMAIL-ADDRESS', value: secondaryEmailAddress },
      {
        label: 'KNOWN-AGENT.CUSTOMER-RISK',
        value: this.agentCustomerData.additionalInformation.riskRating,
      },
      {
        label: 'KNOWN-AGENT.HIGH-RISK-TYPE',
        value: this.agentCustomerData.additionalInformation.highRiskCategory,
      },
    ];
  }


loadLookupData(field: string, searchTerm?: string, targetField?: 'region' | 'placeOfBirth') {
    this.accountService.getLookupWithSearch(field, searchTerm)
        .pipe(takeUntil(this.destroy$))
        .subscribe(data => {
            switch(field) {
                case 'nationalities':
                    this.nationality = data;
                    break;
                case 'nationality':
                  this.countryOfResidence = data;
                    break;
                    case 'drcregions':
                      if (targetField === 'region') {
                          this.region = data;
                      } else if (targetField === 'placeOfBirth') {
                          this.placeOfBirth = data;
                      }
                      break;
              }
        });
}


  public removeAgent() {
    this.router.navigate(['/services/known-agent/remove-agent', this.customerId]);
  }
  
  public toggleAmendFunctions() {
    this.amend = !this.amend;
    // This will show/hide the edit functions section since it's already controlled by the amend flag
  }
  

  saveForms(formObj: AgentFormObj) {
    this.AreValid[formObj.formName as FormNames.FUNCTIONS] = formObj.valid;

    this.formValues = {
        ...this.formValues,
        ...formObj.values,
    };

    let isValid = true;

    if (this.sessionService.subsidiary.countryCode === 'CD') {
        if (
            this.showAgentLimits &&
            this.formValues?.limit !== null &&
            this.formValues.encashmentOfChequesToDefinedLimit === undefined
        ) {
            this.valid = false;
            return;
        }

        if (this.formValues?.encashmentOfChequesToDefinedLimit) {
            this.AreValid.limits = this.formValues?.limit ? true : false;
            this.showAgentLimits = true;
        } else {
            delete this.AreValid.limits;
            delete this.formValues.limit;
            this.showAgentLimits = false;
        }
    } else {
        if (
            this.showAgentLimits &&
            this.formValues?.limit !== null &&
            this.formValues.collectCashFromCompanyCheques === undefined
        ) {
            this.valid = false;
            return;
        }

        if (this.formValues?.collectCashFromCompanyCheques) {
            this.AreValid.limits = this.formValues?.limit ? true : false;
            this.showAgentLimits = true;
        } else {
            delete this.AreValid.limits;
            delete this.formValues.limit;
            this.showAgentLimits = false;
        }
    }

    Object.entries(this.AreValid).forEach(([key, value]) => {
        if (value === false) {
            isValid = value;
            this.valid = value;
        }

        if (value && isValid) {
            this.valid = value;
        }
    });
}


  onDocumentsAttached = (documents: any) => (this.documents = documents);

  saveAgent(_data: any, _result: any) {
    this.createTicketKnownAgent()
      .pipe(
        take(1),
        switchMap(res => {
          if (res.responseObject && res.successful) {
            this.ticket = res.responseObject;
          } else {
            this.toastService.show(
              this.translateService.instant('TOAST.TITLE-ERROR'),
              this.translateService.instant('TOAST.TITLE-ERROR'),
              MessageBoxType.DANGER,
              5000, undefined, undefined, false);
          }

          if (this.documents && this.documents.length !== 0) {
            return this.uploadDocuments();
          } else {
            return of('NODOCUMENTS');
          }
        })
      )
      .subscribe(
        docRes => {
          if (docRes === 'NODOCUMENTS') {
            if (
              this.accMgntObj.currentFlow ===
              CurrentFlowsOptions.CUSTOMERNOTPRESENT
            ) {
              if (_result.skipLastStep) {
                this.verifyBio(this.ticket?.id, _result, false);
              } else {
                this.router.navigateByUrl('dashboard');
              }
            } else {
              this.verifyBio(this.ticket?.id, _result, true);
            }
          }

          if (docRes.successful && docRes.responseObject) {
            const docs = docRes.responseObject;
            const isErrorFile = docs.some((doc: any) => !doc.success);

            if (isErrorFile) {
              docs.forEach((doc: any) => {
                if (!doc.success) {
                  this.toastService.show(
                    this.translateService.instant('TOAST.TITLE-ERROR'),
                    `${this.translateService.instant('TOAST.FAILED-UPLOAD')} ${doc.filename}. ${this.translateService.instant('TOAST.REASON')} ${doc.message}`,
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                  );
                }
              });
              return;
            }
            this.completeTicketDocuments(this.ticket.id, _data, _result);
          }
        },
        docErr => {
          this.toastService.show(
            this.translateService.instant('TOAST.TITLE-ERROR'),
            docErr,
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );

          if (
            this.accMgntObj.currentFlow ===
            CurrentFlowsOptions.CUSTOMERNOTPRESENT
          ) {
            this.router.navigateByUrl('dashboard');
          }
        }
      );
  }

  launchBio(): void {
    const result = 'canVerify';
    if (
      this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT
    ) {
      this.saveAgent(result, { status: 'canNotVerify', skipLastStep: true });
      return;
    }

    if (
      this.accMgntObj.mandate !== 'SELF' ||
      this.customerData.companyDetails
    ) {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBio();
    }
  }

  private openVerifyBio() {
    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '45%',
      height: 'auto',
      data: {
        approvalType: 'KNOWNAGENTSKIPBIO',
        accepted: this.fingerprintAccepted,
        hideSkipBio: false,
        knownAgent: true,
        dontNavigate: true,
        user: {
          firstName: this.accMgntObj.firstName,
          lastName: this.accMgntObj.lastName,
          accounts: [
            {
              accountNumber: this.accMgntObj.accountsId,
              schemeType: this.accMgntObj.accountType,
              mandate: this.accMgntObj.mandate,
            },
          ],
        },
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          this.fingerprintAccepted = result.data;
          if (this.fingerprintAccepted) {
            this.toastService.show(
              this.translateService.instant('TOAST.ACTION-SUCCESSFULLY'), '', MessageBoxType.SUCCESS,
              5000, undefined, undefined, false
            );
          }
          if (result && result.rightFingerPrint && this.fingerprintAccepted) {
            this.saveAgent('canVerify', result);
          }
        }
      });

    this.bioVerifyService.bioVerifyData$
      .pipe(shareReplay(1), take(1), takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.data === 'KNOWNAGENTSKIPBIO') {
          this.accMgntObj.currentFlow = CurrentFlowsOptions.CUSTOMERNOTPRESENT;
          this.saveAgent('canNotVerify', {
            status: 'canNotVerify',
            skipLastStep: true,
          });
        }
      });
  }

  private openSignatoriesDialog(data: any) {
    const user = {
      ...this.customerData,
      accounts: this.customerData.accounts.filter(
        (account: any) => account.accountNumber === this.accMgntObj.accountsId
      ),
    };

    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        approvalType: 'KNOWNAGENTSKIPBIO',
        ticket: this.ticket?.id,
        cif: this.accMgntObj.cif,
        searchFlow: true,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        inProcess: true,
        changeOfMandate: true,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (data === 'canVerify' && result.status === data) {
          this.openVerifySignatoryBioDialog(result.data);
        }
      });

    this.bioVerifyService.bioVerifyData$
      .pipe(shareReplay(1), take(1), takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.data === 'KNOWNAGENTSKIPBIO') {
          this.accMgntObj.currentFlow = CurrentFlowsOptions.CUSTOMERNOTPRESENT;
          this.saveAgent(data, { status: 'canNotVerify', skipLastStep: true });
        }
      });
  }

  private openVerifySignatoryBioDialog(signatories: any) {
    const user = this.customerData;
    const dialogRef_ = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        ticketId: this.ticket?.id,
        cif: this.accMgntObj.cif,
        accepted: this.fingerprintAccepted,
        user,
        hideSkipBio: true,
        signatories: signatories,
        removeKnownAgent: true,
        inProcess: false,
      },
    });

    dialogRef_
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result?.data === true) {
          this.saveAgent('canVerify', result);
        }
      });
  }

  private verifyBio(ticketId: string, result: any, skipBio: boolean) {
    const bioObj = {
      cif: this.accMgntObj
        .cif /*this.isReturned ? this.taskData?.SenderDetails.CustomerId : this.customer?.cif*/,
      fingerprints: [result.rightFingerPrint],
    };
    this.accountService.verifyCustomerBio(ticketId, bioObj, skipBio).pipe(takeUntil(this.destroy$)).subscribe(
      (response) => {
        if (!response.successful) {
          return;
        }
        this.toastService.show(
          this.translateService.instant('TOAST.TITLE'),
          this.translateService.instant('TOAST.SUCCESSFULLY'),
          MessageBoxType.SUCCESS,
          5000, undefined, undefined, false
        );

          if (
            this.accMgntObj.currentFlow ===
            CurrentFlowsOptions.CUSTOMERNOTPRESENT
          ) {
            this.router.navigateByUrl('dashboard');
            return;
          }
          if (!result.searchFlow) {
            const knownAgentDetails = {
              customerId: this.accMgntObj.cif,
              firstName: this.agentData.agentName,
              identityDocumentNumber: this.agentData.id,
              identityDocumentType: this.agentData.documentIdType,
              lastName: '',
              middleName: '',
              serialNumber: '',
              address: '',
              addressType: 'Mailing',
              kraPin: this.agentData.kra,
              action: 'amend',
            };

          localStorage.setItem('knownAgentDetails', JSON.stringify(knownAgentDetails));
          this.router.navigateByUrl('services/known-agent/successful');
        }
      },
      error => {
        this.toastService.show(this.translateService.instant('TOAST.TITLE-ERROR'), error.error.statusMessage, MessageBoxType.DANGER,
        5000, undefined, undefined, false);
      }
    );
  }

  private createTicketKnownAgent() {
    const validFunctions = this.sessionService.subsidiary.countryCode === 'CD' 
        ? [
            'collectBankStatements',
            'collectChequeBooks',
            'balanceEnquiry',
            'encashmentOfChequesToDefinedLimit'
        ]
        : [
            'collectBankStatements',
            'collectDeliverOtherBankMail',
            'collectChequeBooks',
            'collectCashFromCompanyCheques',
            'submitRequestServiceBranch'
        ];

        Object.entries(this.formValues).forEach(([key, value]) => {
          if (value === true && validFunctions.includes(key)) {
              let limit = 0;
              if (this.sessionService.subsidiary.countryCode === 'CD') {
                  if (key === 'encashmentOfChequesToDefinedLimit') {
                      this.assignedFunctionsObject[key] = this.formValues.limit;
                      limit = this.formValues?.limit ? this.formValues.limit : 0;
                  } else {
                      this.assignedFunctionsObject[key] = 0;
                  }
              } else {
                  if (key === 'collectCashFromCompanyCheques') {
                      this.assignedFunctionsObject[key] = this.formValues.limit;
                      limit = this.formValues?.limit ? this.formValues.limit : 0;
                  } else {
                      this.assignedFunctionsObject[key] = 0;
                  }
              }
              // this.assignedFunctions.push({
              //     name: key,
              //     limit
              // });
          }
      });

    let payload: any = {
      associatedId: uuid(),
      customerId: this.accMgntObj.cif,
      customerName: `${this.accMgntObj.firstName} ${this.accMgntObj.lastName}`,
      actionFlow: 'AmendKnownAgentFlow',
      amendAgent: {
        accountNumber: this.accMgntObj.accountsId,
        cif: this.agentData.custId,
        ticketId: this.agentData.ticketId,
        assignedFunctionsAndLimit: this.assignedFunctionsObject,
      },
    };

    if (
      this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT
    ) {
      payload = {
        ...payload,
        ticketId: <string>localStorage.getItem('ticketId'),
      };
    }

    return this.accountService.createTicketKnownAgent(payload);
  }

  private completeTicketDocuments(ticketId: any, data: any, result: any) {
    this.accountService
      .submitTransactionDocuments(ticketId, {})
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (res.successful) {

          this.toastService.show(
            this.translateService.instant('TOAST.TITLE'),
            this.translateService.instant('TOAST.DOCUMENTS-SUBMITTED'),
            MessageBoxType.SUCCESS,
            5000, undefined, undefined, false
          )

            if (
              this.accMgntObj.currentFlow ===
              CurrentFlowsOptions.CUSTOMERNOTPRESENT
            ) {
              if (result.skipLastStep) {
                this.verifyBio(this.ticket?.id, result, false);
              } else {
                this.router.navigateByUrl('dashboard');
              }
            } else {
              this.verifyBio(this.ticket?.id, result, true);
            }
          }
        },
        (err: any) => {
          if (
            err?.status === 403 &&
            this.accMgntObj.currentFlow ===
              CurrentFlowsOptions.CUSTOMERNOTPRESENT
          ) {
            this.router.navigateByUrl('dashboard');
          }
          console.log(err);
        }
      );
  }

  private getfunctions() {
    this.accountService
        .getKnownAgentsFunctions()
        .pipe(takeUntil(this.destroy$))
        .subscribe(functions => {
            this.agentData?.functions?.forEach(_fn => {
                if (this.sessionService.subsidiary.countryCode === 'CD') {
                    if (_fn.name === 'encashmentOfChequesToDefinedLimit') {
                        this.limit = _fn.limit;
                        this.showAgentLimits = true;
                    }
                } else {
                    if (_fn.name === 'collectCashFromCompanyCheques') {
                        this.limit = _fn.limit;
                        this.showAgentLimits = true;
                    }
                }
            });

            this.functionsArray = functions.responseObject.map(_fn => {
                if (this.agentData?.functions) {
                    return {
                        ..._fn,
                        selected: this.agentData?.functions?.some(
                            innerfn => innerfn.name === _fn.name
                        ),
                    };
                } else {
                    return { ..._fn };
                }
            });

            this.functionsArray.forEach(_fn => {
                this.formValues = {
                    [_fn.name]: _fn.selected,
                    ...this.formValues,
                };
            });

            this.AreValid.functions = this.functionsArray.some(_fn => _fn.selected);
        });
}


  private uploadDocuments(): Observable<any> {
    const getUploads = this.documents.map((docs: IUploadedDocument) => ({
      ...docs.document,
      filename: docs.name,
    }));
    getUploads.forEach(docs => (docs.data = docs.data?.split(',')[1]));

    const dataNewGen = {
      CIF: this.accMgntObj.cif,
      AccountNumber: '',
      Country: 'KE',
      ticketNumber: '' + this.ticket?.id,
      idType: 'ID',
      Service: 'NewGen',
      documents: getUploads,
      idNumber: this.agentCustomerData.personalDetails?.idNumber,
    };

    return this.accountService.uploadTransactionDocuments(
      dataNewGen,
      'knownAgent'
    );
  }

  navigateBack() {
    this.router.navigate(['/services/known-agent']);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
