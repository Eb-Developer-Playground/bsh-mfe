import { AfterViewInit, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
import { DialogConfirmComponent } from '@app/shared/components/dialog/dialog-confirm/dialog-confirm.component';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { CurrentFlowsOptions, IAccMgntObj } from '@app/shared/models/common/accMgntObj.model';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { IDocumentSpec, IUploadedDocument } from '@app/shared/modules/upload-docs';
import { BioVerifyService } from '@app/shared/services/bioVerifyStatus.service';
import { v4 as uuid } from 'uuid';

import { IKnownAgent } from '../models/known-agent.models';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ISubsidiary, SessionService } from '@app/shared/services/session/session.service';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { DocumentsUploadDrcComponent } from '@app/shared/components/documents-upload-drc/documents-upload-drc.component';

export interface FileData { filename: string; format: string; data: string; }

interface DocumentResponse {
  successful: boolean;
  responseObject: {
      success: boolean;
      filename: string;
      message: string;
  }[];
}

interface KnownAgentPayload {
  AssociatedId: string;
  CustomerId: string;
  CustomerName: string;
  ActionFlow: string;
  AddAgent: null;
  RemoveAgent: {
      KnowAgenServicetRefrenceId: string;
      FinacleAgentID: string;
      IDNumber: string;
      AccountNumber: string;
      EffectiveDate: string;
      CustomerID: string;
      Comment: any;
  };
  ViewProfileTicketId?: string; 
}
@Component({
  selector: 'app-remove-agent',
  templateUrl: './remove-agent.component.html',
  styleUrls: ['./remove-agent.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    DocumentsUploadDrcComponent,
  ],
})
export class RemoveAgentComponent implements OnInit, AfterViewInit {
  uploadedDocsAreValid = false;
  public fingerprintAccepted: boolean = false;
  public uploadDocumentsStep = false;
  public documents: { fileData: FileData[], valid: boolean } = { fileData: [], valid: false };
  removeForm!: ReturnType<UntypedFormBuilder['group']>;

  agents!: IKnownAgent[];
  subsidiary: ISubsidiary;
  minDate = new Date();
  today = new Date();
  maxDate = new Date(
    this.minDate.getFullYear() + 1,
    this.minDate.getMonth(),
    this.minDate.getDay()
  );
  private ticket!: any;
  private customer!: IAccMgntObj;
  private accMgntObj: any;
  private agentId!: string;
  private customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  private customerCifData: any = JSON.parse(
    <string>localStorage.getItem('customerCifData')
  );

  private destroy$ = new Subject();

  public uploadedDocs: IUploadedDocument[] = [];
  public UploadDocuments: IDocumentSpec[] = [];


  private formatDate(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  private formatDateShort(date: Date): string {
    const d = new Date(date);
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${String(d.getDate()).padStart(2, '0')}-${months[d.getMonth()]}-${d.getFullYear()}`;
  }

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private accountService: AccountService,
    private toastService: ToastService,
    private bioVerifyService: BioVerifyService,
    private translateService: TranslateService,
    private session: SessionService,
    private actionTicketsService: ActionTicketsService
    
  ) {
    this.subsidiary = this.session.subsidiary;
    this.removeForm = this.fb.group({
      agent_name: [null, Validators.required],
      date: [null, Validators.required],
      remarks: ['']
    });
  }

  ngAfterViewInit(): void {
    if (this.route.snapshot.params['id']) {
      this.agentId = this.route.snapshot.params['id'];
    }
    this.getAgents(this.customer.accountsId);
  }

  ngOnInit(): void {
    if (this.route.snapshot.params['id']) {
      this.agentId = this.route.snapshot.params['id'];
    }
    let customer: any = localStorage.getItem('accMgntObj');
    this.customer = JSON.parse(customer);
    this.accMgntObj = this.customer;
    this.removeForm.patchValue({
        date: new Date()
    });

    // Automatically fetch documents for CD
    if (this.subsidiary.countryCode === 'CD') {
        this.initializeDocuments();
    }
}

private initializeDocuments(): void {
  const agent = this.removeForm.controls['agent_name'].value;
  const effectiveDate = this.removeForm.controls['date'].value;
  let payload = {
      AssociatedId: uuid(),
      CustomerId: this.customer.cif,
      CustomerName: `${this.customer.firstName} ${this.customer.lastName}`,
      ActionFlow: "RemoveKnownAgentFlowV2",
      RemoveAgent: {
          KnowAgenServicetRefrenceId: uuid(),
          FinacleAgentID: this.agentId,
          IDNumber: this.customer.idNumber,
          AccountNumber: this.customer.accountsId,
          EffectiveDate: this.formatDate(effectiveDate),
          CustomerID: this.customer.cif,
          Comment: this.removeForm.controls['remarks'].value
      }
  };

  this.accountService.createTicketKnownAgent(payload)
      .pipe(
          take(1),
          switchMap(res => {
              if (res.responseObject && res.successful) {
                  this.ticket = res.responseObject;
                  return this.actionTicketsService.getListOfDocumentsPartialV3(this.ticket.id);
              }
              throw new Error('Ticket creation failed');
          })
      )
      .subscribe({
          next: (response: any) => {
              if (response.responseObject?.documents) {
                  this.UploadDocuments = response.responseObject.documents.map((doc: any) => ({
                      name: doc.fileName,
                      description: doc.fileName,
                      maxSize: 1024 * 1024,
                      required: doc.required,
                      docCode: doc.documentCode,
                      fileTypes: doc.fileExtensions?.map((ext: string) => 
                        ext === 'pdf' ? 'application/pdf' : `image/${ext}`
                    )
                }));
              }
          }
      });
}


  showQuitDialog(): void {

    const title = 'COMMON.ARE-YOU-SURE';
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      width: '400px',
      height: 'auto',
      data: { title }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$)
    ).subscribe((option: boolean) => {
      if (option) {
        if (this.customer.isPresent) {
          this.router.navigate(['/services/known-agent']);
        } else {
          this.router.navigate(['/services/account-services']);
        }
      }
    });
  }

  launchBio(): void {
    const result = 'canVerify';

    if (this.customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
      this.removeAgent('canNotVerify', true);
      return
    }

    if (this.customer.mandate !== 'SELF' || this.customerCifData.companyDetails) {
      this.openSignatoriesDialog(result);
    } else {
      this.openVerifyBio();
    }


    this.bioVerifyService.bioVerifyData$.pipe(
      take(1),
      shareReplay(1),
      takeUntil(this.destroy$),
    ).subscribe(res => {
      if (res.data === 'KNOWNAGENTSKIPBIO') {
        this.customer.currentFlow = CurrentFlowsOptions.CUSTOMERNOTPRESENT
        this.removeAgent(res, false);
      }
    })
  }

  showRemoveDialog(): void {
    const dataObject: { code: string; title: string, value: string }[] = [];
    const agent = this.removeForm.controls['agent_name'].value;
    const effectiveDate = this.removeForm.controls['date'].value;

    const formattedDate = effectiveDate ? 
    this.formatDateShort(effectiveDate) : 
    this.formatDateShort(new Date());
    
    dataObject.push(
      { code: 'agentName', title: 'KNOWN-AGENT.AGENT-NAME', value: <string>agent?.agentName },
      { code: 'agentid', title: 'KNOWN-AGENT.CIF', value: <string>agent?.custId },
      { code: 'effectiveDate', title: 'KNOWN-AGENT.EFFECTIVE-DATE', value: formattedDate },
  );
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
        width: '600px',
        data: {
            title: 'KNOWN-AGENT.REMOVE-KNOWN-AGENT',
            bodyDescription: `${this.translateService.instant('KNOWN-AGENT.REMOVE-KNOWN-AGENT-DETAILS')}`,
            dataObject
        }
    });

    dialogRef.afterClosed()
        .pipe(takeUntil(this.destroy$))
        .subscribe((option: any) => {
            if (option?.confirm) {
                if (this.subsidiary.countryCode === 'CD' && this.uploadedDocs.length) {
                    this.uploadDocumentsAndLaunchBio();
                } else {
                    this.launchBio();
                }
            }
        });
}

private uploadDocumentsAndLaunchBio(): void {
  let processedDocs = this.uploadedDocs
      .filter(doc => 
          doc?.document && 
          doc.name && 
          doc.docCode &&
          doc.document.data &&
          doc.document.format
      )
      .map(doc => ({
          ...doc?.document,
          filename: doc.name,
          DocCode: doc.docCode?.toString().padStart(3, '0'),
          data: doc.document.data?.split(',')[1]
      }));

  const payload = {
      processName: 'Customer Onboarding',
      processId: this.customer.cif,
      AccountNumber: this.customer.accountsId,
      CIF: this.customer.cif,
      branch: this.session.user?.branchid,
      Country: this.subsidiary.countryCode,
      ticketNumber: this.ticket.id.toString(),
      idType: this.customer.idType,
      idNumber: this.customer.idNumber,
      documents: processedDocs,
      Service: 'Blob'
  };


  this.accountService.uploadTransactionDocumentsV3(payload)
      .pipe(
          switchMap(() => this.accountService.submitTransactionDocumentsV3(this.ticket.id))
      )
      .subscribe({
          next: () => {
              this.launchBio();
          },
          error: (err) => {
              this.toastService.show(
                  this.translateService.instant('TOAST.TITLE-ERROR'),
                  err.error?.statusMessage || 'Document upload failed',
                  MessageBoxType.DANGER,
                  5000,
                  undefined,
                  undefined,
                  false
              );
          }
      });
}



getDocuments(documents: IUploadedDocument[]) {
  this.uploadedDocsAreValid = documents
      .filter(doc => doc.required)
      .every(doc => doc.fileName && doc.docCode);

  if (this.uploadedDocsAreValid) {
      this.uploadedDocs = documents;
  }
}

  continueStep() {
        this.uploadDocumentsStep = true;
    }


  private removeAgent(result: any, skipBio: boolean = false) {
    if (this.session.subsidiary.countryCode === 'CD') {
      if (this.uploadedDocs.length !== 0) {
          this.completeTicketDocuments(this.ticket.id, true);
      } else {
          this.verifyBio(this.ticket?.id, result, true);
      }
      return;
  }
  
      // Existing implementation for other subsidiaries
    const agent: IKnownAgent = this.removeForm.controls['agent_name'].value;

    let payload: any = {
      AssociatedId: uuid(),
      CustomerId: this.customer.cif,
      CustomerName: `${this.customer.firstName}${this.customer.lastName}`,
      ActionFlow: "RemoveKnownAgentFlow",
      AddAgent: null,
      RemoveAgent: {
        KnowAgenServicetRefrenceId: uuid(),
        FinacleAgentID: agent.custId,
        IDNumber: this.customer.idNumber,
        AccountNumber: this.customer.accountsId,
        EffectiveDate: this.formatDate(
          this.removeForm.controls['date'].value
        ),
        CustomerID: this.customer.cif,
        Comment: ''
      }
    }

    const viewProfileTicketId = <string>localStorage.getItem('ticketId');
    if (this.customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT && viewProfileTicketId) {
      payload = { ...payload, ViewProfileTicketId: viewProfileTicketId };
    }
    this.accountService.createTicketKnownAgent(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data.responseObject && data.successful) {
          this.ticket = data.responseObject;
          if (this.uploadedDocs.length !== 0) {
            /* if (this.customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {*/
            const ticketId = this.ticket.id
            this.completeTicketDocuments(ticketId, true);
          } else {
            this.verifyBio(this.ticket?.id, result, true);
          }
        } else {
          this.toastService.show("Error", data?.statusMessage, MessageBoxType.DANGER,
            5000, undefined, undefined, false
          );
        }

      }, err => {
        const _err = err?.error?.responseObject ? err.error.responseObject : 'error'
        this.toastService.show(
          `Error`,
          _err?.error?.statusMessage,
          MessageBoxType.DANGER,
          5000, undefined, undefined, false
        )
        this.uploadDocumentsStep = false;
      });
  }

  
  
  
  private verifyBio(ticketId: string, result: any, skipBio: boolean) {
    const bioObj = {
      cif: this.customer.cif,
      fingerprints: [result.rightFingerPrint],
      userId: this.customerData.userId
    };

    this.accountService.verifyCustomerBio(ticketId, bioObj, skipBio)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {

        if (!result.successful) {
          return;
        }

        if (this.customer.currentFlow !== CurrentFlowsOptions.CUSTOMERNOTPRESENT) {

          const _date = new Date(this.removeForm.controls['date'].value);
          _date.setHours(0, 0, 0, 0);
          const _today = new Date();
          _today.setHours(0, 0, 0, 0);

          const diffDays = Math.round((_date.getTime() - _today.getTime()) / (1000 * 60 * 60 * 24));
          let message = diffDays === 0 ?
            `${this.translateService.instant('KNOWN-AGENT.REMOVED')}` :
            `${this.translateService.instant('KNOWN-AGENT.REMOVED-SCHEDULED')} ${this.formatDate(_date)}`

          this.toastService.show(
            'Successfull',
            message,
            MessageBoxType.SUCCESS,
            5000, undefined, undefined, false
          );
        }


        if (this.customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
          this.router.navigateByUrl('dashboard');
          return;
        }

        if (!result.searchFlow) {
          this.navigateToSuccess();
        }
      },
        error => { this.toastService.show('error', error.error.statusMessage, MessageBoxType.DANGER,
          5000, undefined, undefined, false
        ); })
  }

  private getAgents(accountNumber: string) {
    this.accountService.getKnownAgents(accountNumber)
      .pipe(takeUntil(this.destroy$))
      .subscribe(( agents: {responseObject: IKnownAgent[];
        statusCode:     string;
        statusMessage:  string;
        successful:     boolean }) => {

        if (!this.agentId) {
          this.agents = agents.responseObject.filter(agent => agent.deleted !== "Y");
        } else {
          this.agents = agents.responseObject.filter(agent => agent.deleted !== "Y" && agent.custId === this.agentId);
          this.removeForm.controls['agent_name'].setValue(this.agents[0]);
        }
        if (this.agents.length === 0) {
          this.toastService.show(
            'message',
            'this account has no agents to remove',
            MessageBoxType.DANGER,
            5000, undefined, undefined, false
          )
        }
      }, err => {
        const _err = err.error ? err.error : 'error'
        this.toastService.show(
          'err',
          _err,
          MessageBoxType.DANGER,
          5000, undefined, undefined, false
        )
      });
  }


  uploadTransactionDocuments() {

    const getUploads = this.uploadedDocs.map((docs: IUploadedDocument) => {
      return {
        ...docs.document
        // filename: docs.document.filename,
        // format: docs.document.format,
        // data: docs.document.filename
      }
    }


    );

    //getUploads.forEach((docs) => (docs.data = docs.data?.split(',')[1]));
    const data = {
      CIF: this.customer.cif,
      AccountNumber: '',
      Country: 'KE',
      ticketNumber: '' + this.ticket?.id,
      idType: 'ID',
      Service: "NewGen",
      documents: getUploads,
      idNumber: this.customer.idNumber
    };

    return this.accountService.uploadTransactionDocuments(data)
      .pipe(takeUntil(this.destroy$),
        tap(docRes => {
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

          }
        }))

  }

private completeTicketDocuments(ticketId: any, skipBio = false) {
    if (this.session.subsidiary.countryCode === 'CD') {
        this.verifyBio(ticketId, { rightFingerPrint: {} },
            this.customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT ? false : true
        );
        return;
    }

    let rxFlow = this.uploadTransactionDocuments().pipe(
        switchMap(() => this.accountService.submitTransactionDocuments(ticketId, {}))
    );

    rxFlow.pipe(takeUntil(this.destroy$))
        .subscribe({
            next: (res) => {
                if (res.successful) {
                    this.toastService.show(
                        this.translateService.instant('TOAST.TITLE'),
                        this.translateService.instant('TOAST.DOCUMENTS-SUBMITTED'),
                        MessageBoxType.SUCCESS,
                        5000, undefined, undefined, false
                    );
                    this.verifyBio(
                        ticketId,
                        { rightFingerPrint: {} },
                        this.customer.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT ? false : true
                    );
                }
            },
            error: (err) => {
                this.toastService.show(
                    this.translateService.instant('TOAST.TITLE-ERROR'),
                    err.error.statusMessage || 'Document submission failed',
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        });
}


  ngOnDestroy(): void {
    // localStorage.removeItem('accMgntObj');
    // localStorage.removeItem('ticketId');
    this.destroy$.next('');
    this.destroy$.complete();
  }


  openSignatoriesDialog(data: any) {
    const user = {
      ...this.customerData,
      accounts: this.customerData.accounts.filter((account: any) => 
        account.accountNumber === this.accMgntObj.accountsId)
    };  
    const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
      width: '50%',
      height: 'auto',
      data: {
        approvalType: 'KNOWNAGENTSKIPBIO',
        ticket: this.ticket?.id,
        cif: this.customer.cif,
        searchFlow: true,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        inProcess: true,
        changeOfMandate: true
      },
    });

    dialogRef.afterClosed().subscribe((result: any) => {

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

  openVerifyBio() {
    const agent: IKnownAgent = this.removeForm.controls['agent_name'].value;
    const agentName = agent.agentName.split(' ')
    const firstName = this.customer.firstName;
    const lastName = this.customer.lastName;
    const agentFirstName = agentName[0];
    const agentLastName = agentName[agentName.length - 1];

    const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
      width: '45%',
      height: 'auto',
      data: {
        approvalType: 'KNOWNAGENTSKIPBIO',
        accepted: this.fingerprintAccepted,
        hideSkipBio: true,
        knownAgent: true,
        inProcess: false,
        dontNavigate: true,
        user: {
          firstName,
          lastName,
          // actions: 'removeAgent',
          // agentFirstName,
          // agentLastName,
          accounts: [{
            accountNumber: this.customer.accountsId,
            schemeType: this.customer.accountType,
            mandate: this.customer.mandate,
          }]
        },
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result) {
          this.fingerprintAccepted = result.data && result.data !== 'skipBio';
          if (this.fingerprintAccepted) {
            this.toastService.show(
              'Success', 'Action submitted successfully', MessageBoxType.SUCCESS,
              5000, undefined, undefined, false
            );
            this.removeAgent(result);
          }


        }
      });

  }

  openVerifySignatoryBioDialog(signatories: any) {
    const user = {
      ...this.customerData,
      accounts: this.customerData.accounts.filter((account: any) => 
        account.accountNumber === this.accMgntObj.accountsId)
    };  
    const dialogRef = this.dialog.open(VerifySignatoryBioDialogComponent, {
      data: {
        ticketId: this.ticket?.id,
        cif: this.customer.cif,
        accepted: this.fingerprintAccepted,
        user: user,
        hideSkipBio: true,
        signatories: signatories,
        removeKnownAgent: true,
        inProcess: true
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result?.data === true) {
          this.toastService.show('Success', 'Action submitted successfully', MessageBoxType.SUCCESS,
            5000, undefined, undefined, false
          );
          this.removeAgent(result);
          //this.navigateToSuccess();
        }
      });
  }

  openSkipBioDialog(event?: string) {
    const user = {
      ...this.customerData,
      accounts: this.customerData.accounts.filter((account: any) => 
        account.accountNumber === this.accMgntObj.accountsId)
    };  
    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        approvalType: 'KNOWNAGENTSKIPBIO',
        user: event ? user : '',
        headerText: event ? 'Known agent verification' : 'Skip Biometric',
        subHeaderText: event ? 'Requirements for known agent verification' : 'Requirements for bio-override'
      },
    })

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (result) {

          this.removeAgent(result);
          //this.navigateToSuccess();
        }
      })
  }

  private navigateToSuccess() {
    const agent: IKnownAgent = this.removeForm.controls['agent_name'].value;
    const identityDocumentNumber = agent.id
    const knownAgentDetails = {
      customerId: this.customer.cif,
      firstName: agent.agentName,
      identityDocumentNumber,
      identityDocumentType: "ID",
      lastName: '',
      middleName: '',
      serialNumber: agent.custId,
      address: '',
      addressType: 'Mailing',
      kraPin: '',
      accountType: this.customer.accountType
    }
    localStorage.setItem('knownAgentDetails', JSON.stringify(knownAgentDetails));
    this.router.navigateByUrl('/services/known-agent/successful/remove');
  }
  // clearAccountInquiryCache() {
  //   this.accountService.clearAccountInquiryCache(`?Id=${this.customer.cif}&bankId=${this.customer.bankID}&idType=customerid`).subscribe((v: any) => {
  //   })
  // }
}
