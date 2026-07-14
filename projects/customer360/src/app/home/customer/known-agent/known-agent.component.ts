import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map, shareReplay, switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
import { DialogConfirmComponent } from '@app/shared/components/dialog/dialog-confirm/dialog-confirm.component';
import { VerifyBioDialogComponent } from '@app/shared/components/verify-bio-dialog/verify-bio-dialog.component';
import { VerifySignatoryBioDialogComponent } from '@app/shared/components/verify-signatory-bio-dialog/verify-signatory-bio-dialog.component';
import { VerifySignatoryDialogComponent } from '@app/shared/components/verify-signatory-dialog/verify-signatory-dialog.component';
import { VerifySkipBioComponent } from '@app/shared/components/verify-skip-bio/verify-skip-bio.component';
import { AgentFormAreValid, AgentFormObj, FormNames } from '@app/shared/models';
import { IAccMgntObj } from '@app/shared/models/common';
import { CurrentFlowsOptions } from '@app/shared/models/common/accMgntObj.model';
import { Address, CifInquiryObject, ContactDetails } from '@app/shared/models/common/cifinquiry.model';
import { FingerprintsService } from '@app/shared/modules/fingerprints';
import { DedupeService } from '@app/shared/modules/identification/dedupe.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { IDocumentSpec, IUploadedDocument } from '@app/shared/modules/upload-docs';
import { ApiService, SessionService } from '@app/shared/services';
import { BioVerifyService } from '@app/shared/services/bioVerifyStatus.service';
import { environment } from '@env/environment';
import { v4 as uuid } from 'uuid';
import { IknownAgentDetails } from '@app/shared/models/common/knownAgent.model';
import { AgentForm, IKnownAgentFunctions } from './models/known-agent.models';
import { TicketsService } from '@app/core/services';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import CONST from "@app/shared/utils/constants";
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { IDedupeCIFResult } from '@app/shared/modules/identification/types';
import { AccountSelectionService } from '@app/core/services/account-selection/account-selection.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { CustomerDedupeAndIdentificationDetailsComponent } from '@app/shared/components/customer-dedupe-and-identification-details/customer-dedupe-and-identification-details.component';
import { KnownAgentDetailsComponent } from '@app/shared/components/known-agent-details/known-agent-details.component';
import { KnownAgentAdditionalInformationComponent } from '@app/shared/components/known-agent-additional-information/known-agent-additional-information.component';
import { KnownAgentEditFunctionsComponent } from './known-agent-edit-functions/known-agent-edit-functions.component';
import { KnownAgentLimitsComponent } from './known-agent-limits/known-agent-limits.component';
import { DocumentsUploadDrcComponent } from '@app/shared/components/documents-upload-drc/documents-upload-drc.component';
import { DocumentsUploadComponent } from '@app/shared/modules/upload-docs';
import { KnownAgentViewAgentDetailsComponent } from './known-agent-view-agent-details/known-agent-view-agent-details.component';
import { RemoveAgentComponent } from './remove-agent/remove-agent.component';

const {COUNTRY_CODE} = CONST;

interface DocumentResponse {
    successful: boolean;
    responseObject: {
        success: boolean;
        filename: string;
        message: string;
    }[];
}
@Component({
    selector: 'app-known-agent',
    templateUrl: './known-agent.component.html',
    styleUrls: ['./known-agent.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TranslatePipe,
        MatToolbarModule,
        MatButtonModule,
        MatDialogModule,
        CustomerDedupeAndIdentificationDetailsComponent,
        KnownAgentDetailsComponent,
        KnownAgentAdditionalInformationComponent,
        KnownAgentEditFunctionsComponent,
        KnownAgentLimitsComponent,
        DocumentsUploadDrcComponent,
        DocumentsUploadComponent,
        KnownAgentViewAgentDetailsComponent,
        RemoveAgentComponent,
    ],
})
export class KnownAgentComponent implements OnInit {

    public is_complete: boolean = false;

    public findAgentStep: boolean = true;
    public detailAgentStep: boolean = false;
    public uploadDocumentsStep: boolean = false;
    public lastStep: boolean = false;
    public assignedFunctions: any[] = [];
    public assignedFunctionsObject: any = {};

    public findAgentFlow: boolean = false;
    public fingerprintAccepted: boolean = false;
    public agent: { value: any, valid: boolean } = { value: null, valid: false }
    public knownAgentDetails!: IknownAgentDetails;
    public agentDetails: any = {};
    public editAgentNames = false;
    public editKraPin = false;
    public contactDetails!: ContactDetails;
    private accMgntObj!: IAccMgntObj;
    private ticket: any;
    private documentIds: string[] = [];
    private destroy$ = new Subject();
    public uploadedDocs: IUploadedDocument[] = [];
    public uploadedDocsAreValid = false;
    dedupeChecked: boolean = false;

    public personalDetailsReadonly!: boolean;
    public kraInputReadonly!: boolean;
    public iprsCheckResult!: any;
    public photoUrl?: SafeUrl;
    public signatureUrl?: SafeUrl;
    public AgentAccountNumber: string = '';
    countryCode: string=''
    public displayAgentDetails: boolean = false;
    subsidiary: ISubsidiary;
    selectedLanguage: string = '';
    

    public UploadDocuments: IDocumentSpec[] = [
        {
            name: 'photo',
            description: 'Agent Photo',
            required: true,
            maxSize: 100 * 1024, //100Kbs
            fileTypes: ["image/png", "image/jpeg"],
        }, {
            name: 'resolution_letter',
            description: 'Resolution letter',
            required: true,
            maxSize: 10000 * 1024 //100Kbs
        },{
            name: 'Introduction_form',
            description: 'Introduction form',
            required: true,
            maxSize: 10000 * 1024 //100Kbs
        }, {
            name: 'signature',
            description: 'Agent Signature',
            required: true,
            maxSize: 100 * 1024, //100Kbs,
            fileTypes: ["image/png", "image/jpeg"],
        }, {
            name: 'national_id',
            description: 'Agent id / Passport',
            required: true,
            maxSize: 1000 * 1024 //100Kbs
        }, {
            name: 'kra_pin',
            description: 'Agent KRA PIN certficate',
            required: true,
            maxSize: 10000 * 1024 //100Kbs
        }
    ];

    @Input() identificationDetailsFormGroupName!: string;
    @Input() sharedRequestId?: string;
    @Input() useNewIDForm?: boolean = true;
    @Input() redirectExistingCustomerToStaticData?: boolean;
    @Input() doNotRedirectExistingCustomerToLandingOnCancel?: boolean;

    //@Output() onBreakFlow: EventEmitter<void> = new EventEmitter<void>();
    //@Output() onSearchPerformed: EventEmitter<any> = new EventEmitter<any>();
    //@Output() onIPRSCheckSuccessful: EventEmitter<any> = new EventEmitter<any>();
    @Output() onIPRSCheckFailed: EventEmitter<void> = new EventEmitter<void>();
    @Output() onKRAPinSuccessful: EventEmitter<void> = new EventEmitter<void>();

    public form!: UntypedFormGroup;

    showAgentLimits = false;
    documentIdType!: string;
    documentId!: string;

    functionsArray: IKnownAgentFunctions[] = [];

    private customerData: any = JSON.parse(<string>localStorage.getItem('customerDetails'));
    private customerCifData: any = JSON.parse(<string>localStorage.getItem('customerCifData'));

    constructor(
        private fb: UntypedFormBuilder,
        private translateService: TranslateService,
        private bioVerifyService: BioVerifyService,
        private router: Router, public dialog: MatDialog,
        private accountService: AccountService,
        private toastService: ToastService,
        private dedupeService: DedupeService,
        private route: ActivatedRoute,
        private session: SessionService,
        private ticketService: TicketsService,
        private sanitizer: DomSanitizer,
        public apiService: ApiService,
        private actionTicketsService: ActionTicketsService,
        private accountSelectionService: AccountSelectionService
    ) {
        this.subsidiary = this.session.subsidiary;
        this.form = this.fb.group({
            contactDetails: this.fb.group({})
        });
    }

    public AreValid: AgentFormAreValid = {
        /*highRisk: false,*/
        functions: false,
        limits: false,
        additionalInformation: true

    };
    public valid: boolean = false

    formValues: AgentForm = {};

    ngOnInit(): void {

        this.countryCode = this.session.subsidiary.countryCode;

        this.router.url === '/services/known-agent/successful' ? this.is_complete = true : this.is_complete = false;

        if (this.router.url.includes('/services/known-agent/add-agent')) {
            this.findAgentFlow = true;
        }

        const accMgntObj: any = localStorage.getItem('accMgntObj');
        this.accMgntObj = JSON.parse(accMgntObj);

        // Handle CIF from onboarding & Restore
        const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
        const cifId = this.route.snapshot.queryParams['cifId'];

        if (isRestore && cifId) {
            const storedAgentData = localStorage.getItem('restoreAgentData');
            if (storedAgentData) {
                const agentData = JSON.parse(storedAgentData);

                if (agentData.deleted === "Y") {
                    agentData.deleted = "N";
                    localStorage.setItem('restoreAgentData', JSON.stringify(agentData));
                }

                this.agent = {
                    value: {
                        id_number: cifId,
                        id_type: 'customerid'
                    },
                    valid: true
                };
                this.findAgent();
            }
        }        

        if (this.route.snapshot.queryParams['returnCtx']) {

            const returnPayload = this.route.snapshot.queryParams['returnCtx'];
            const data = JSON.parse(atob(returnPayload));

            if (data?.status === 'success' && data?.action === 'CREATE CIF') {
                //remove, kra pin and national_id because they were already uploaded in onboarding
                this.UploadDocuments = this.UploadDocuments.filter(document => !['national_id', 'kra_pin'].includes(document.name));
                this.findAgentStep = false;
                this.detailAgentStep = true;

                if (!data?.customerId) {
                    this.cifCreationNeedApprobal(data.ticketId)
                }

                this.agent = {
                    value: {
                        id_number: data?.customerId,
                        id_type: 'customerid'
                    }, valid: true
                }

                this.findAgent();
                // For DRC, ensure we create a ticket and fetch document requirements
    if (this.session.subsidiary.countryCode === 'CD') {
        // We need to wait for findAgent to complete and populate knownAgentDetails
        // So we'll use a setTimeout to ensure this happens after findAgent completes
        setTimeout(() => {
            if (this.knownAgentDetails) {
                this.createTicketKnownAgent()
                    .pipe(take(1))
                    .subscribe(res => {
                        if (res.responseObject && res.successful) {
                            this.ticket = res.responseObject;
                            this.actionTicketsService
                                .getListOfDocumentsPartialV2(this.ticket.id)
                                .subscribe(
                                    (response: any) => {
                                        if (response.responseObject) {
                                            this.UploadDocuments = response.responseObject.documents.map((doc: any) => ({
                                                name: doc.fileName,
                                                description: doc.description || doc.fileName,
                                                maxSize: 1024 * 1024,
                                                required: doc.required,
                                                docCode: doc.documentCode,
                                                fileTypes: doc.fileExtensions?.map((ext: string) => 
                                                    ext === 'pdf' ? 'application/pdf' : `image/${ext}`
                                                )
                                            }));
                                            
                                            this.ensurePhotoAndSignatureDocuments();
                                        }
                                    }
                                );
                        }
                    });
            }
        }, 1000);
    }

            }

            if (data?.status === 'abort') {
                this.showQuitDialog();
            }
        }

        if (!this.accMgntObj) {
            this.router.navigateByUrl('/services');
        }

        this.getfunctions();
    }

    IPRSCheckFailed = () => this.onIPRSCheckFailed.emit();
    patchWithKRAResult = (kraCheckResult: any) => {

        //const personalDetailsForm = this.form.get(this.personalDetailsFormGroupName);
        this.kraInputReadonly = !!kraCheckResult?.pin;
        if (!!kraCheckResult?.pin)
            this.onKRAPinSuccessful.emit();
        // personalDetailsForm!.patchValue({
        //     krapInNumber: kraCheckResult?.pin || ''
        // });
    }

    private ensurePhotoAndSignatureDocuments() {
    
        const hasPhoto = this.UploadDocuments.some(doc => 
            (doc.name && doc.name.toLowerCase().includes('photo')) || 
            (doc.description && doc.description.toLowerCase().includes('photo'))
        );
        
        const hasSignature = this.UploadDocuments.some(doc => 
            (doc.name && (doc.name.toLowerCase().includes('signature') || doc.name.toLowerCase().includes('sign'))) || 
            (doc.description && (doc.description.toLowerCase().includes('signature') || doc.description.toLowerCase().includes('sign')))
        );
        
        const photoSignatureMaxSize = this.session.subsidiary.countryCode === 'CD' ? 200 * 1024 : 100 * 1024;
        
        if (!hasPhoto) {
            this.UploadDocuments.push({
                name: 'Customer Photo',
                description: 'Agent Photo',
                required: true,
                maxSize: photoSignatureMaxSize, 
                docCode: '079',
                fileTypes: ["image/png", "image/jpeg"]
            });
        } else {
            this.UploadDocuments.forEach(doc => {
                if ((doc.name && doc.name.toLowerCase().includes('photo')) || 
                    (doc.description && doc.description.toLowerCase().includes('photo'))) {
                    doc.docCode = '079';
                    doc.name = 'Customer Photo';
                    doc.maxSize = photoSignatureMaxSize; 
                }
            });
        }
        
        if (!hasSignature) {
            this.UploadDocuments.push({
                name: 'Customer Signature',
                description: 'Agent Signature',
                required: true,
                maxSize: photoSignatureMaxSize,
                docCode: '085',
                fileTypes: ["image/png", "image/jpeg"]
            });
        } else {
            this.UploadDocuments.forEach(doc => {
                if ((doc.name && (doc.name.toLowerCase().includes('signature') || doc.name.toLowerCase().includes('sign'))) || 
                    (doc.description && (doc.description.toLowerCase().includes('signature') || doc.description.toLowerCase().includes('sign')))) {
                    doc.docCode = '085';
                    doc.name = 'Customer Signature';
                    doc.maxSize = photoSignatureMaxSize;
                }
            });
        }
    }
    
    
    

    patchWithIPRSResult = (iprsCheckResult?: any) => {
        if (!this.iprsCheckResult && !!iprsCheckResult)
            this.iprsCheckResult = iprsCheckResult;

        this.personalDetailsReadonly = !!this.iprsCheckResult;

        if (!this.iprsCheckResult) return;

    }

    onCustomerDedupeChecked = (event: {
        userData: CifInquiryObject,
        formValues: {
            nationality: string;
            countryOfResidence: string;
            refNum: string;
            idType: string;
            status: string;
            region: string;
            maritalStatus: string;
            placeOfBirth: string;
            birthPlace: string;
            preferredLanguageCode: string;
        }
    }) => {
        this.agent = {
            value: {
                id_number: event.formValues.refNum,
                id_type: event.formValues.idType
            }, valid: true
        }
        if (event.formValues.status === 'EXISTINGUSER') {
            this.toastService.show('success',
                'Customer Found',
                MessageBoxType.SUCCESS, 5000,
            undefined,
                undefined,
                false)
            
            // Check if the customer is the account owner
            if (event.userData?.personalDetails?.customerId && +event.userData?.personalDetails?.customerId === +this.accMgntObj.cif) {
                this.toastService.show(
                    this.translateService.instant('TOAST.TITLE-ERROR'),
                    `${this.translateService.instant('KNOWN-AGENT.ACCOUNT-OWER-CANT-BE-AGENT',
                        { name: `${event.userData.personalDetails?.firstName} ${event.userData.personalDetails?.lastName}` })}`,
                    MessageBoxType.WARNING, 5000, undefined, undefined, false
                );
                return;
            }
    
            if (event.userData?.personalDetails?.customerId) {
                const customerId = +event.userData?.personalDetails?.customerId;
                
                // Check if the customer is a signatory on the account
                this.checkIfSignatory(customerId, event.userData).pipe(
                    takeUntil(this.destroy$),
                    switchMap(isSignatory => {
                        if (isSignatory) {
                            this.toastService.show(
                                this.translateService.instant('TOAST.TITLE-ERROR'),
                                `${this.translateService.instant('KNOWN-AGENT.SIGNATORY-CANT-BE-AGENT',
                                    { name: `${event.userData.personalDetails?.firstName} ${event.userData.personalDetails?.lastName}` })}`,
                                MessageBoxType.WARNING, 5000, undefined, undefined, false
                            );
                            return of(null); 
                        }
                        
                        // If not a signatory, check if already an agent
                        return this.accountService.getKnownAgentsByCif(this.accMgntObj.accountsId, customerId);
                    })
                ).subscribe(result => {
                    if (result === null) {
                        return; 
                    }
                    
                    const agents = result as any[];
                    if (agents.length !== 0) {
                        this.toastService.show(
                            this.translateService.instant('TOAST.TITLE-ERROR'),
                            `${this.translateService.instant('KNOWN-AGENT.ALREADY-ACCOUNT-AGENT',
                                { name: `${event.userData.personalDetails?.firstName} ${event.userData.personalDetails?.lastName}` })}`,
                            MessageBoxType.WARNING, 
                            5000, undefined, undefined, false
                        );
                        return;
                    }
                    
                    this.initExistingUser(event);
                });
            } else {
                this.initExistingUser(event);
            }
        } else {
            this.initNonExistingUser(event.formValues);
        }
    }
    
    
    private checkIfSignatory(customerId: number, userData: CifInquiryObject): Observable<boolean> {
        return this.accountService.getAccount(
            `?Id=${this.accMgntObj.accountsId}&bankId=${this.accMgntObj.bankID}&idType=accountid`, 
            true
        ).pipe(
            map(response => {
                if (!response.successful || !response.responseObject) {
                    return false;
                }
                
                const account = response.responseObject;
                
                if (!account.signatories || account.signatories.length === 0) {
                    return false;
                }
                
                const isSignatory = account.signatories.some((signatory: any) => {
                    
                    if (signatory.cif && signatory.cif.toString() === customerId.toString()) {
                        return true;
                    }
                    
                    if (signatory.idNumber && userData.personalDetails?.idNumber && 
                        signatory.idNumber === userData.personalDetails.idNumber) {
                        return true;
                    }
                    
                    if (signatory.name && 
                        userData.personalDetails?.firstName && 
                        userData.personalDetails?.lastName) {
                        const signatoryName = signatory.name.toLowerCase();
                        const customerFirstName = userData.personalDetails.firstName.toLowerCase();
                        const customerLastName = userData.personalDetails.lastName.toLowerCase();
                        
                        const nameMatch = signatoryName.includes(customerFirstName) && 
                                         signatoryName.includes(customerLastName);
                        
                        if (nameMatch) {
                        }
                        
                        return nameMatch;
                    }
                    
                    return false;
                });
                
                return isSignatory;
            }),
            catchError(error => {
                console.error('Error checking if customer is a signatory:', error);
                return of(false);
            })
        );
    }
       

saveForms(formObj: AgentFormObj) {
    this.AreValid[formObj.formName as FormNames.FUNCTIONS | FormNames.LIMITS | FormNames.ADDITIONALINFORMATION] = formObj.valid;

    this.formValues = {
        ...this.formValues,
        ...formObj.values
    }
    let isValid = true;

    if (this.session.subsidiary.countryCode === 'CD') {
        if (this.formValues?.encashmentOfChequesToDefinedLimit) {
            this.AreValid.limits = this.formValues?.limit ? true : false;
            this.showAgentLimits = true;
        } else {
            delete this.AreValid.limits;
            delete this.formValues.limit;
            this.showAgentLimits = false;
        }
    } else {
        if (this.formValues?.collectCashFromCompanyCheques) {
            this.AreValid.limits = this.formValues?.limit ? true : false;
            this.showAgentLimits = true;
        } else {
            delete this.AreValid.limits;
            delete this.formValues.limit;
            this.showAgentLimits = false;
        }
    }

    Object.entries(this.AreValid).forEach(
        ([key, value]) => {
            if (value === false) {
                isValid = value;
                this.valid = value;
            }

            if (value && isValid) {
                this.valid = value;
            }
        }
    );
}

showAgentDetails() {
    if (this.session.subsidiary.countryCode === 'CD') {
        
        const photoDoc = this.uploadedDocs.find(doc => 
            doc?.name?.toLowerCase().includes('photo'));
        const signatureDoc = this.uploadedDocs.find(doc => 
            doc?.name?.toLowerCase().includes('signature') || 
            doc?.name?.toLowerCase().includes('sign'));
            
        if (!photoDoc || !signatureDoc) {
            this.toastService.show(
                'Required Documents Missing',
                'Photo and signature documents are required.',
                MessageBoxType.WARNING,
                5000, undefined, undefined, false
            );
            return;
        }

        if (photoDoc) {
            photoDoc.docCode = '079';
            photoDoc.name = 'Customer Photo';
        }
        
        if (signatureDoc) {
            signatureDoc.docCode = '085';
            signatureDoc.name = 'Customer Signature';
        }

        let allDocuments = this.uploadedDocs
            .filter(doc =>
                doc?.document &&
                doc.name &&
                doc.docCode &&
                doc.document.data &&  
                doc.document.format  
            )
            .map(doc => {
                let docCopy = {...doc};
                let docCode = docCopy.docCode?.toString() || '';
                const lowerName = docCopy.name.toLowerCase();
                
                if (lowerName.includes('photo')) {
                    docCopy.name = 'Customer Photo'; 
                    docCode = '079';
                } else if (lowerName.includes('signature') || lowerName.includes('sign')) {
                    docCopy.name = 'Customer Signature'; 
                    docCode = '085';
                }
                
                return {
                    ...docCopy?.document,
                    filename: docCopy.name,
                    DocCode: docCode.padStart(3, '0')
                };
            });

        allDocuments.forEach(docs => {
            if (docs.data && docs.data.includes(',')) {
                docs.data = docs.data.split(',')[1];
            }
        });
   
        const docsForNewGen = allDocuments.filter(doc => {
            const filename = (doc.filename || '').toLowerCase();
            return !filename.includes('photo') &&
                !filename.includes('signature') &&
                !filename.includes('sign');
        });

        const basePayload = {
            processName: 'Customer Onboarding',
            processId: this.knownAgentDetails.customerId,
            CIF: this.accMgntObj.cif,
            branch: this.session.user?.branchid,
            Country: this.session.subsidiary.countryCode,
            ticketNumber: this.ticket.id.toString(),
            idType: this.knownAgentDetails.identityDocumentType,
            idNumber: this.knownAgentDetails.identityDocumentNumber,
            AccountNumber: this.accMgntObj.accountsId
        };

        const dataBlobPayload = {
            ...basePayload,
            Service: 'Blob',
            documents: allDocuments 
        };
        
        const dataNewgenPayload = {
            ...basePayload,
            Service: 'NewGen',
            documents: docsForNewGen 
        };

        this.accountService.uploadTransactionDocumentsV3(dataBlobPayload, 'knownAgent')
        .pipe(
            tap(response => {
                if (response.responseObject) {
                    this.documentIds = (response.responseObject as Array<{success: boolean, id: string}>)
                        .filter(doc => doc.success)
                        .map(doc => doc.id);
                }                
            }),
            switchMap(() => this.accountService.uploadTransactionDocumentsV3(dataNewgenPayload, 'knownAgent'))
        )
        .subscribe({
            next: () => {
                const agent = {
                    custId: this.knownAgentDetails.customerId,
                    email: this.formValues.items?.[0]?.email || '',
                    email2: this.formValues.items?.[1]?.email || '',
                    functions: this.assignedFunctions,
                    effectiveDate: this.formValues.effectiveDate,
                    phone: this.formValues.items?.[0] ? `${this.formValues.items[0].code} ${this.formValues.items[0].mobileNumber}` : '',
                    phone2: this.formValues.items?.[1] ? `${this.formValues.items[1].code} ${this.formValues.items[1].mobileNumber}` : '',
                    datecreated: '',
                    firstName: this.knownAgentDetails.firstName,
                    lastName: this.knownAgentDetails.lastName,
                    agentLimit: this.formValues.limit?.toString(),
                    id: this.documentId,
                    documentIdType: this.documentIdType,
                    ticketId: this.ticket.id
                };

                 // Check if this is a restore operation
                 const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
                 const agentId = this.route.snapshot.queryParams['agentId'];
                 
                 // Store restoration info for later use
                 if (isRestore && agentId) {
                     localStorage.setItem('isAgentRestore', 'true');
                     localStorage.setItem('restoredAgentId', agentId);
                 }

                localStorage.setItem('SELECTEDAGENT', JSON.stringify(agent));
                this.uploadDocumentsStep = false;
                this.lastStep = true;
            },
                    error: (err) => {
                        this.toastService.show(
                            this.translateService.instant('TOAST.TITLE-ERROR'),
                            err.error?.statusMessage || 'Document submission failed',
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                });
        } else {
        const getUploads = this.uploadedDocs.map((docs: IUploadedDocument) => ({
            ...docs.document,
            filename: docs.name,
        }));

        this.documentIdType = <string>this.knownAgentDetails?.identityDocumentType;
        this.documentId = <string>this.knownAgentDetails.identityDocumentNumber;
        const agent = {
            custId: this.knownAgentDetails.customerId,
            email: this.formValues.items && this.formValues.items[0].email ? this.formValues.items[0].email : '',
            email2: this.formValues.items && this.formValues.items[1]?.email ? this.formValues.items[1].email : '',
            functions: this.assignedFunctions,
            effectiveDate: this.formValues.effectiveDate,
            phone: `${this.formValues.items && this.formValues.items[0]?.code ? +this.formValues.items[0].code + ' ' : ''}${this.formValues.items && this.formValues.items[0]?.mobileNumber ? this.formValues.items[0].mobileNumber : ''}`,
            phone2: `${this.formValues.items && this.formValues.items[1]?.code ? +this.formValues.items[1].code + ' ' : ''}${this.formValues.items && this.formValues.items[1]?.mobileNumber ? this.formValues.items[1].mobileNumber : ''}`,
            // agentKraID: `${this.editKraPin ? this.formValues.kraPin : this.knownAgentDetails.kraPin}`,
            // agentDocumentID: `${this.documentId}`,
            datecreated: '',
            firstName: this.knownAgentDetails.firstName,
            lastName: this.knownAgentDetails.lastName,
            agentLimit: this.formValues.limit?.toString(),
            //ticketId: this.ticket?.id,
            getUploads,
            id:this.documentId,
            documentIdType: this.documentIdType
        };

        localStorage.setItem('SELECTEDAGENT', JSON.stringify(agent));
        this.uploadDocumentsStep = false
        this.lastStep = true;
    }
}

    saveAgent(_data: any, _result: any) {
        const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
        const isCD = this.session.subsidiary.countryCode === 'CD';
        
        if (isCD) {
          if (isRestore) {
            const restoreData = JSON.parse(localStorage.getItem('restoreAgentData') || '{}');
            if (restoreData.deleted === 'Y') {
              restoreData.deleted = 'N';
              localStorage.setItem('restoreAgentData', JSON.stringify(restoreData));
            }
          }
          this.completeTicketDocuments(this.ticket.id, _data, _result);
          return;
        }

        this.createTicketKnownAgent()
            .pipe(take(1))
            .subscribe(res => {
                if (res.responseObject && res.successful) {
                    this.ticket = res.responseObject;

                    const getUploads = this.uploadedDocs.map((docs: IUploadedDocument) => ({
                        ...docs.document,
                        filename: docs.name,
                    }));
                    getUploads.forEach((docs) => (docs.data = docs.data?.split(',')[1]));

                    const blobDocuments = {
                        CIF: this.accMgntObj.cif,
                        AccountNumber: this.accMgntObj.accountsId,
                        Country: 'KE',
                        ticketNumber: '' + this.ticket?.id,
                        idType: 'ID',
                        Service: "Blob",
                        documents: getUploads.filter(d => ['signature', 'photo'].includes(d.filename)),
                        idNumber: this.knownAgentDetails.identityDocumentNumber
                    };

                    const newGenDocuments = {
                        CIF: this.accMgntObj.cif,
                        AccountNumber: this.accMgntObj.accountsId,
                        Country: 'KE',
                        ticketNumber: '' + this.ticket?.id,
                        idType: 'ID',
                        Service: "NewGen",
                        documents: getUploads.filter(d => !['signature', 'photo'].includes(d.filename)),
                        idNumber: this.knownAgentDetails.identityDocumentNumber
                    };

                    this.accountService.uploadTransactionDocuments(blobDocuments, 'knownAgent').pipe(
                        switchMap(() => this.accountService.uploadTransactionDocuments(newGenDocuments, 'knownAgent')),
                        takeUntil(this.destroy$)
                    ).subscribe(
                        docRes => {
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
                                docErr.error?.statusMessage,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, false
                            );

                            if (this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
                                this.router.navigateByUrl('dashboard');
                            }
                        }
                    );
                } else {
                    this.toastService.show(
                        this.translateService.instant('TOAST.TITLE-ERROR'),
                        this.translateService.instant('TOAST.TITLE-ERROR'),
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false);
                }
            }, err => {
                const _err = err?.error?.responseObject ? err.error.responseObject : 'error'
                this.toastService.show(
                    this.translateService.instant('TOAST.TITLE-ERROR'),
                    _err.error.statusMessage, MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                )
                this.uploadDocumentsStep = false;
            });
    }

    
    continueStep() {
        if (this.findAgentStep) {
            this.dedupeService.setDoDedupeObs(true);
            return;
        }
        
        if (this.detailAgentStep) {
            this.assignedFunctions = [];
            const validFunctions = this.session.subsidiary.countryCode === 'CD'
                ? ['collectBankStatements', 'collectChequeBooks', 'balanceEnquiry', 'encashmentOfChequesToDefinedLimit']
                : ['collectBankStatements', 'collectDeliverOtherBankMail', 'collectChequeBooks', 'collectCashFromCompanyCheques', 'submitRequestServiceBranch'];
    
            Object.entries(this.formValues).forEach(([key, value]) => {
                if (value === true && validFunctions.includes(key)) {
                    let limit = 0;
                    if ((this.session.subsidiary.countryCode === 'CD' && key === 'encashmentOfChequesToDefinedLimit') ||
                        (this.session.subsidiary.countryCode !== 'CD' && key === 'collectCashFromCompanyCheques')) {
                        this.assignedFunctionsObject[key] = this.formValues.limit;
                        limit = this.formValues?.limit ? this.formValues.limit : 0;
                    } else {
                        this.assignedFunctionsObject[key] = 0;
                        limit = 0;
                    }
                    this.assignedFunctions.push({
                        name: key,
                        limit
                    });
                }
            });
    
            if (this.session.subsidiary.countryCode === 'CD') {
                this.createTicketKnownAgent()
                    .pipe(take(1))
                    .subscribe({
                        next: res => {
                            if (res.responseObject && res.successful) {
                                this.ticket = res.responseObject;
                                this.actionTicketsService
                                    .getListOfDocumentsPartialV2(this.ticket.id)
                                    .subscribe({
                                        next: (response: any) => {
                                            if (response.responseObject) {
                                                this.UploadDocuments = response.responseObject.documents.map((doc: any) => ({
                                                    name: doc.fileName,
                                                    description: doc.description || doc.fileName,
                                                    maxSize: 1024 * 1024,
                                                    required: doc.required,
                                                    docCode: doc.documentCode,
                                                    fileTypes: doc.fileExtensions?.map((ext: string) => 
                                                        ext === 'pdf' ? 'application/pdf' : `image/${ext}`
                                                    )
                                                }));
                                                
                                                this.ensurePhotoAndSignatureDocuments();
                                                this.detailAgentStep = false;
                                                this.uploadDocumentsStep = true;
                                            } else {
                                                console.error('No documents in response:', response);
                                                this.toastService.show(
                                                    this.translateService.instant('TOAST.TITLE-ERROR'),
                                                    'No document requirements found',
                                                    MessageBoxType.DANGER,
                                                    5000, undefined, undefined, false
                                                );
                                            }
                                        },
                                        error: (error: any) => {
                                            console.error('Error getting document list:', error);
                                            this.toastService.show(
                                                this.translateService.instant('TOAST.TITLE-ERROR'),
                                                error.error?.statusMessage || 'Failed to get document requirements',
                                                MessageBoxType.DANGER,
                                                5000, undefined, undefined, false
                                            );
                                            // Still proceed to document upload step with default documents
                                            this.ensurePhotoAndSignatureDocuments();
                                            this.detailAgentStep = false;
                                            this.uploadDocumentsStep = true;
                                        }
                                    });
                            } else {
                                console.error('Ticket creation failed:', res);
                                this.toastService.show(
                                    this.translateService.instant('TOAST.TITLE-ERROR'),
                                    res.statusMessage || 'Failed to create ticket',
                                    MessageBoxType.DANGER,
                                    5000, undefined, undefined, false
                                );
                            }
                        },
                        error: err => {
                            console.error('Error creating ticket:', err);
                            const errorMessage = err.error?.statusMessage || 
                                                err.error?.message || 
                                                err.message || 
                                                'Unknown error creating ticket';
                            
                            this.toastService.show(
                                this.translateService.instant('TOAST.TITLE-ERROR'),
                                errorMessage,
                                MessageBoxType.DANGER,
                                5000, undefined, undefined, false
                            );
                        }
                    });
            } else {
                this.detailAgentStep = false;
                this.uploadDocumentsStep = true;
            }
        }
    }
    
    goBack() {
        if (this.findAgentStep === true) {
            this.router.navigateByUrl('/services/known-agent');
        }

        if (this.detailAgentStep === true) {
            const returnPayload = this.route?.snapshot?.queryParams?.['returnCtx'];
            if (returnPayload) {
                const data = JSON.parse(atob(returnPayload));

                if (returnPayload && data?.status === 'success' && data?.action === 'CREATE CIF') {
                    this.router.navigateByUrl('/services/known-agent/add-agent');
                }
            }

            this.detailAgentStep = false;
            this.findAgentStep = true
        }

        if (this.uploadDocumentsStep) {
            this.uploadDocumentsStep = false;
            this.detailAgentStep = true;
        }

        if (this.lastStep) {
            this.lastStep = false;
            this.uploadDocumentsStep = true;
        }

    }

    goTofindAgentStep() {
        this.uploadDocumentsStep = false;
        //this.findAgentStep = false;
    }

    checkFromFinacleNationalID(formValue: any) {
        this.agent = formValue;
    }

    private selectAgentDedupeCif(cifData: {
        customerData: CifInquiryObject, formValues: {
            nationality: string;
            countryOfResidence: string;
            refNum: string;
            idType: string;
        }
    }) {
        const userData = cifData.customerData;
        const formValues = cifData.formValues;
    
        this.findAgentStep = false;
        this.detailAgentStep = true;
        if (userData?.personalDetails?.customerId) {
            let idNumber = formValues.refNum || userData.personalDetails.idNumber;
            let idType = formValues.idType || userData.personalDetails.idType;
    
            // For DRC, check identificationDetails for ID information if not already set
            if (this.session.subsidiary.countryCode === 'CD' && (!idNumber || idNumber === 'null')) {
                const identifications = userData.identificationDetails || [];
                if (identifications.length > 0) {
                    idNumber = identifications[0].referenceNum;
    
                    const docDesc = identifications[0].docDesc;
                    if (docDesc) {
                        if (docDesc.includes('MILITARY')) {
                            idType = 'MilitaryID';
                        } else if (docDesc.includes('PASSPORT')) {
                            idType = 'DRCPassport';
                        } else if (docDesc.includes('DRIVER')) {
                            idType = 'DRCDriversLicense';
                        } else if (docDesc.includes('VOTER')) {
                            idType = 'DRCVotersCard';
                        } else if (docDesc.includes('STUDENT')) {
                            idType = 'StudentID';
                        } else if (docDesc.includes('POLICE')) {
                            idType = 'PoliceID';
                        } else if (docDesc.includes('REFUGEE')) {
                            idType = 'DRCRefugeeId';
                        } else if (docDesc.includes('FOREIGN')) {
                            idType = 'DRCForeignPassport';
                        } else {
                            idType = 'NationalIdentification';
                        }
                    }
                }
            }
    
            // Get the stored agent data if available
            const storedAgentData = JSON.parse(localStorage.getItem('createCIFAgentData') || '{}');
            
            // If we have stored agent data from CIF creation, use it
            if (storedAgentData && storedAgentData.refNum && storedAgentData.idType) {
                idNumber = storedAgentData.refNum;
                idType = storedAgentData.idType;
            }
            
        const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
        if (isRestore) {
            const storedAgentData = JSON.parse(localStorage.getItem('restoreAgentData') || '{}');
            
            if (storedAgentData && storedAgentData.id) {
                idNumber = storedAgentData.id;
                
                if (this.session.subsidiary.countryCode === 'CD') {
                  if (storedAgentData.idType) {
                    idType = storedAgentData.idType;
                  } else {
                    if (storedAgentData.documentIdType) {
                      switch (storedAgentData.documentIdType.toUpperCase()) {
                        case 'VOTERCARD':
                        case 'VOTER CARD':
                          idType = 'VoterCard';
                          break;
                        case 'PASSPORT':
                          idType = 'DRCPassport';
                          break;
                        case 'DRIVERSLICENSE':
                        case 'DRIVERS LICENSE':
                          idType = 'DRCDriversLicense';
                          break;
                        case 'MILITARYID':
                        case 'MILITARY ID':
                          idType = 'MilitaryID';
                          break;
                        case 'POLICEID':
                        case 'POLICE ID':
                          idType = 'PoliceID';
                          break;
                        case 'STUDENTID':
                        case 'STUDENT ID':
                          idType = 'StudentID';
                          break;
                        case 'FOREIGNPASSPORT':
                        case 'FOREIGN PASSPORT':
                          idType = 'DRCForeignPassport';
                          break;
                        case 'REFUGEEID':
                        case 'REFUGEE ID':
                          idType = 'DRCRefugeeId';
                          break;
                        case 'CUSTOMERID':
                          idType = 'customerid';
                          break;
                        default:
                          idType = 'NationalIdentification';
                          break;
                      }
                    } else {
                      idType = 'NationalIdentification';
                    }
                  }
                } else {
                  idType = storedAgentData.idType || 'NationalId';
                }
              }              
        }
    
            this.knownAgentDetails = {
                customerId: userData?.personalDetails?.customerId,
                firstName: userData?.personalDetails?.firstName,
                identityDocumentNumber: idNumber,
                identityDocumentType: idType,
                lastName: userData?.personalDetails?.lastName,
                middleName: userData?.personalDetails?.middleName,
                serialNumber: userData?.personalDetails?.idSerialNumber,
                address: this.getAddresses(userData?.contactDetails.addresses),
                addressType: userData?.contactDetails.addresses[0]?.addressType || 'Mailing',
                kraPin: this.session.subsidiary.countryCode !== 'CD' ?
                    userData?.personalDetails?.krapInNumber :
                    undefined,
                gender: userData?.personalDetails?.gender,
                nationality: userData?.personalDetails?.nationality,
                countryOfResidence: userData?.personalDetails?.countryOfResidence,
                birthDate: userData?.personalDetails?.birthDate,
                placeOfBirth: userData?.personalDetails?.placeOfBirth,
                region: userData?.personalDetails?.region,
                maritalStatus: this.getMaritalStatusDescription(userData?.personalDetails?.maritalStatus),
                preferredLanguageCode: userData?.personalDetails?.preferredLanguageCode,
                language: userData?.personalDetails?.language
            };
    
            // For DRC, ensure we have valid ID information
            if (this.session.subsidiary.countryCode === 'CD' && (!this.knownAgentDetails.identityDocumentNumber || this.knownAgentDetails.identityDocumentNumber === 'null')) {
                // If we still don't have a valid ID number, use the CIF
                this.knownAgentDetails.identityDocumentNumber = this.knownAgentDetails.customerId;
                this.knownAgentDetails.identityDocumentType = 'NationalIdentification';
            }
    
            this.contactDetails = userData.contactDetails;
        } else {
            console.error('No customer ID found in CIF data');
            this.findAgentStep = true;
            this.detailAgentStep = false;
            return;
        }
    }
    
    

    initExistingUser(cifData: {
        userData: CifInquiryObject,
        formValues: {
            nationality: string;
            countryOfResidence: string;
            region: string;
            maritalStatus: string;
            placeOfBirth: string;
            birthPlace: string;
            preferredLanguageCode: string;
            refNum: string;
            idType: string;
        }
    }) {
        const userData = cifData.userData;
        const formValues = cifData.formValues;
        this.findAgentStep = false;
        this.detailAgentStep = true;

        if(this.agentDetails){
        let cif=userData?.personalDetails?.customerId;
        let bankID=this.agentDetails?.accountDetails?.bankId;
        let url = `?Id=${cif}&bankId=${bankID}&idType=customerid`;
        this.accountService
        .getAccount(url).subscribe({
            next: (res: any) => {
                if (res.successful) {

                 this.AgentAccountNumber=res.responseObject.accounts[0]?.accountNumber;
                 let customerid=res.responseObject.cif;
                }
            },
        })
      }
        if(userData?.personalDetails?.customerId) {
            this.agentDetails=userData;
        }
        localStorage.setItem('agentDetails', JSON.stringify(userData));
        if (userData.personalDetails?.customerId) {

            this.knownAgentDetails = {
                customerId: userData?.personalDetails?.customerId,
                firstName: userData?.personalDetails?.firstName,
                identityDocumentNumber: formValues?.refNum,
                identityDocumentType: formValues?.idType,
                lastName: userData?.personalDetails?.lastName,
                middleName: userData?.personalDetails?.middleName,
                serialNumber: userData?.personalDetails?.idSerialNumber,
                address: this.getAddresses(userData?.contactDetails.addresses),
                addressType: userData?.contactDetails.addresses[0].addressType,
                kraPin: this.session.subsidiary.countryCode !== 'CD' ?
                    userData?.personalDetails?.krapInNumber :
                    null,
                gender: userData?.personalDetails?.gender,
                nationality: formValues.nationality,
                countryOfResidence: formValues.countryOfResidence,
                birthDate: userData?.personalDetails?.birthDate,
                placeOfBirth: formValues.birthPlace,
                region: formValues.birthPlace,
                maritalStatus: this.getMaritalStatusDescription(userData?.personalDetails?.maritalStatus),
                preferredLanguageCode: userData?.personalDetails?.preferredLanguageCode ,
                language: userData?.personalDetails?.language
            }
            this.contactDetails = userData.contactDetails;
        } else {

            this.findAgentStep = true;
            this.detailAgentStep = false;
            return;
        }
    }

    initNonExistingUser(agent: any) {
        let type;
        if (this.session.subsidiary.countryCode === 'CD') {
            type = this.translateService.instant('TOAST.DOCUMENT-NOT-EXISTS');
        } else {
            type = this.translateService.instant(
                this.agent.value.id_type === 'ID' || 
                this.agent.value.id_type === 'nationalid' ? 
                    'TOAST.ID-NOT-EXISTS' : 
                    'TOAST.PASSPORT-NOT-EXISTS'
            );
        }
        
        const id = this.agent.value.id_number;
        
        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            width: '400px',
            height: 'auto',
            data: {
                title: 'TOAST.CUSTOMER-NOT-EXIST',
                bodyDescription: `${this.translateService.instant('TOAST.TYPE-NOT-EXIST-CONTINUE-ONBOARDING', { type, id })}`
            }
        });
    
        dialogRef.afterClosed().subscribe((option: any) => {
            if (option?.confirm) {
                this.createCIF(agent);
            }
        });
    }
    private findAgent() {
        const id = this.agent.value.id_number;
        if (id) {
            
            let type = 'nationalid';
            switch (this.agent.value.id_type) {
                case 'customerid':
                    type = 'customerid';
                    break;
                case 'ID':
                default:
                    type = 'nationalid';
                    break;
                case 'PASSPORT':
                    type = 'passportno';
                    break;
            }
    
            const idUriString = `?Id=${id}&bankId=${this.accMgntObj.bankID}&idType=${type}`;
    
            this.accountService.getAccount(idUriString)
                .pipe(
                    switchMap(account => {
                        const isBusiness: boolean =
                            !!account.responseObject?.identifications.find(
                                (identification: any) => identification.type === "CompRegNo" && identification.id !== "");
    
                        const cifInquiryData = {
                            BankId: this.accMgntObj.bankID,
                            CustomerID: this.agent.value.id_number,
                        };
    
                        return this.accountService.cifInquiryV2(isBusiness, cifInquiryData);
                    }),
                    takeUntil(this.destroy$)
                )
                .subscribe({
                    next: (v) => {
                        if (v.responseObject) {
                            this.findAgentStep = false;
                            this.detailAgentStep = true;
    
                            // Get the stored agent data if available
                            const storedAgentData = JSON.parse(localStorage.getItem('createCIFAgentData') || '{}');
                            
                            // Determine the ID type and number to use
                            let idType = v.responseObject?.personalDetails?.idType;
                            let idNumber = v.responseObject?.personalDetails?.idNumber;
                            
                            // For newly created CIFs, use the stored data if available
                            if (storedAgentData && storedAgentData.refNum && storedAgentData.idType) {
                                idType = storedAgentData.idType;
                                idNumber = storedAgentData.refNum;
                            }
                            
                            const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
                            if (isRestore) {
                                const storedAgentData = JSON.parse(localStorage.getItem('restoreAgentData') || '{}');
                                
                                if (storedAgentData && storedAgentData.id) {
                                    idNumber = storedAgentData.id;
                                    
                                    if (storedAgentData && storedAgentData.documentIdType) {
                                       
                                        switch (storedAgentData.documentIdType.toUpperCase()) {
                                          case 'VOTERCARD':
                                          case 'VOTER CARD':
                                            idType = 'DRCVotersCard';
                                            break;
                                          case 'PASSPORT':
                                            idType = 'DRCPassport';
                                            break;
                                          case 'DRIVERSLICENSE':
                                          case 'DRIVERS LICENSE':
                                            idType = 'DRCDriversLicense';
                                            break;
                                          case 'MILITARYID':
                                          case 'MILITARY ID':
                                            idType = 'MilitaryID';
                                            break;
                                          case 'POLICEID':
                                          case 'POLICE ID':
                                            idType = 'PoliceID';
                                            break;
                                          case 'STUDENTID':
                                          case 'STUDENT ID':
                                            idType = 'StudentID';
                                            break;
                                          case 'FOREIGNPASSPORT':
                                          case 'FOREIGN PASSPORT':
                                            idType = 'DRCForeignPassport';
                                            break;
                                          case 'REFUGEEID':
                                          case 'REFUGEE ID':
                                            idType = 'DRCRefugeeId';
                                            break;
                                          case 'CUSTOMERID':
                                            idType = 'customerid';
                                            break;
                                          default:
                                            idType = 'NationalIdentification';
                                            break;
                                        }
                                      } else {
                                        idType = 'NationalIdentification';
                                      }
                                    } else {
                                      idType = 'NationalId';
                            }
                        }
                            
                            const cifData: {
                                customerData: CifInquiryObject, formValues: {
                                    nationality: string;
                                    countryOfResidence: string;
                                    refNum: string;
                                    idType: string;
                                }
                            } = {
                                customerData: v.responseObject,
                                formValues: {
                                    nationality: v.responseObject?.personalDetails?.nationality,
                                    countryOfResidence: v.responseObject?.personalDetails?.countryOfResidence,
                                    refNum: idNumber || v.responseObject?.personalDetails?.idNumber,
                                    idType: idType || v.responseObject?.personalDetails?.idType,
                                }
                            };
                            
                            this.selectAgentDedupeCif(cifData);
                        }
                    },
                    error: error => {
                        console.error('Error finding agent:', error);
                        const err = error.message ? error.message : 'error';
                        this.toastService.show('Error', err, MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                        this.findAgentStep = true;
                    },
                });
        }
    }
    
        
    

    
    // getDocuments(documents: IUploadedDocument[]) {
    //     console.log('Uploaded Documents:', documents);
    //     this.uploadedDocsAreValid = documents.filter(doc => doc.required).every(doc => doc.fileName);
    //     if (this.uploadedDocsAreValid) {
    //         this.uploadedDocs = documents;
    //         console.log('Valid Documents Set:', this.uploadedDocs);
    //     }
    // }
    
    getDocuments(documents: IUploadedDocument[]) {
        this.uploadedDocs = documents;
        const photoAndSignature = ['Customer Signature', 'Customer Photo'];
        const uploadedPhotoAndSignature = documents.filter(
            doc => photoAndSignature.includes(doc.name)
        );
        
        localStorage.setItem(
            'photoAndSignature',
            JSON.stringify(uploadedPhotoAndSignature) || '[]'
        );
        
        const requiredDocs = documents.filter(doc => doc.required);
        
        if(this.session.subsidiary.countryCode === 'CD') {
            const invalidDocs = requiredDocs.filter(doc => !doc.fileName || !doc.docCode);
            this.uploadedDocsAreValid = requiredDocs.length > 0 && invalidDocs.length === 0;

            if (!this.uploadedDocsAreValid && documents.length > 0) {
                const hasPhoto = documents.some(doc => 
                    doc.name && (doc.name.toLowerCase().includes('photo') || 
                    doc.description?.toLowerCase().includes('photo')));
                
                const hasSignature = documents.some(doc => 
                    doc.name && (doc.name.toLowerCase().includes('signature') || 
                    doc.name.toLowerCase().includes('sign') || 
                    doc.description?.toLowerCase().includes('signature')));
                
                this.uploadedDocsAreValid = hasPhoto && hasSignature;
            }
        } else {
            this.uploadedDocsAreValid = requiredDocs.length > 0 && 
                requiredDocs.every(doc => doc.fileName);
        }
    }
      

    showQuitDialog(): void {

        const title = this.translateService.instant('COMMON.ARE-YOU-SURE');
        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            width: '400px',
            height: 'auto',
            data: { title }
        });

        dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$)
        ).subscribe((option: boolean) => {
            if (option) {
                this.router.navigate(['/services']);
            }
        });
    }

    launchBio(): void {

        const result = 'canVerify';
        if (this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
            this.saveAgent(result, { status: 'canNotVerify', skipLastStep: true });
            return;
        }


        if (this.accMgntObj.mandate !== 'SELF' || this.customerCifData.companyDetails) {
            this.openSignatoriesDialog(result);
        } else {
            this.openVerifyBio();
        }
    }

    lastStepBio(data: any, result: any) {

        if (data === 'canVerify' && result.data && result.status === data)
            return this.openVerifySignatoryBioDialog(result.data);
    }

    openVerifyBio() {

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
                    // actions: 'addAgent',
                    // agentFirstName: this.knownAgentDetails?.firstName,
                    // agentLastName: this.knownAgentDetails?.lastName,
                    firstName: this.accMgntObj.firstName,
                    lastName: this.accMgntObj.lastName,
                    accounts: [{
                        accountNumber: this.accMgntObj.accountsId,
                        schemeType: this.accMgntObj.accountType,
                        mandate: this.accMgntObj.mandate,
                    }]
                }
            },
        });

        dialogRef.afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
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

        this.bioVerifyService.bioVerifyData$.pipe(
            shareReplay(1),
            take(1),
            takeUntil(this.destroy$),
        ).subscribe(res => {

            if (res.data === 'KNOWNAGENTSKIPBIO') {
                this.accMgntObj.currentFlow = CurrentFlowsOptions.CUSTOMERNOTPRESENT;
                this.saveAgent('canNotVerify', { status: 'canNotVerify', skipLastStep: true });
            }
        })
    }

    openSignatoriesDialog(data: any) {
        const selectedAccount = this.accountSelectionService.getSelectedAccountWithFallbacks();
        const user = {
            ...this.customerData,
            accounts: this.customerData.accounts.filter((account: any) => 
                account.accountNumber === selectedAccount?.accountNumber)
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
                changeOfMandate: true
            },
        });

        dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$)
        ).subscribe((result) => {
            if (data === 'canVerify' && result.status === data) {
                this.openVerifySignatoryBioDialog(result.data);
            }
        });

        this.bioVerifyService.bioVerifyData$.pipe(
            shareReplay(1),
            take(1),
            takeUntil(this.destroy$)
        ).subscribe(res => {
            if (res.data === 'KNOWNAGENTSKIPBIO') {
                this.accMgntObj.currentFlow = CurrentFlowsOptions.CUSTOMERNOTPRESENT;
                this.saveAgent(data, { status: 'canNotVerify', skipLastStep: true });
            }
        })
    }

    openVerifySignatoryBioDialog(signatories: any) {
        const selectedAccount = this.accountSelectionService.getSelectedAccountWithFallbacks();
        const user = {
            ...this.customerData,
            accounts: this.customerData.accounts.filter((account: any) => 
              account.accountNumber === selectedAccount?.accountNumber)
          };  
          const dialogRef_ = this.dialog.open(VerifySignatoryBioDialogComponent, {
            data: {
              ticketId: this.ticket?.id,
              cif: this.accMgntObj.cif,
              accepted: this.fingerprintAccepted,
              user,
              hideSkipBio: true,
              signatories: signatories,
              removeKnownAgent: true,
              inProcess: false
            },
          });

        dialogRef_.afterClosed().pipe(
            takeUntil(this.destroy$)
        ).subscribe((result) => {

            if (result?.data === true) {
                this.saveAgent('canVerify', result);
            }
        });
    }

    openSkipBioDialog(event?: string) {
        const selectedAccount = this.accountSelectionService.getSelectedAccountWithFallbacks();
        const user = event ? {
            ...this.customerData,
            accounts: this.customerData.accounts.filter((account: any) => 
                account.accountNumber === selectedAccount?.accountNumber)
        } : '';
        
        const dialogRef = this.dialog.open(VerifySkipBioComponent, {
            data: {
                approvalType: 'KNOWNAGENTSKIPBIO',
                user: event ? user : '',
                headerText: event ? 'Known agent verification' : 'Skip Biometric',
                subHeaderText: event ? 'Requirements for known agent verification' : 'Requirements for bio-override'
            },
        });

        dialogRef.afterClosed().pipe(
            takeUntil(this.destroy$)
        ).subscribe((result) => { });
    }

    dedupeFormIsValid(isValid: boolean) {
        this.agent.valid = isValid
    }

    ngOnDestroy(): void {
        // localStorage.removeItem('accMgntObj');
        // localStorage.removeItem('ticketId');
        this.destroy$.next('');
        this.destroy$.complete();
    }

    private createCIF(
        agent: {
            nationality: string;
            countryOfResidence: string;
            refNum: string;
            idType: string;
        }
    ): void {
    
        const currentRoute = window.location.href;
        
        // Store the agent data for retrieval after CIF creation
        localStorage.setItem('createCIFAgentData', JSON.stringify({
            nationality: agent.nationality,
            countryOfResidence: agent.countryOfResidence,
            refNum: agent.refNum,
            idType: agent.idType
        }));
    
        // Define required uploads based on subsidiary and ID type
        let requiredUploads = [];
        
        if (this.session.subsidiary.countryCode === 'CD') {
            // For DRC, customize based on ID type
            let idDocName = "National ID";
            let idDocDescription = "NationalId";
            
            switch (agent.idType) {
                case 'DRCVotersCard':
                    idDocName = "Voter Card";
                    idDocDescription = "VoterCard";
                    break;
                case 'DRCPassport':
                    idDocName = "Passport";
                    idDocDescription = "Passport";
                    break;
                case 'DRCDriversLicense':
                    idDocName = "Driver's License";
                    idDocDescription = "DriversLicense";
                    break;
                case 'MilitaryID':
                    idDocName = "Military ID";
                    idDocDescription = "MilitaryId";
                    break;
                case 'PoliceID':
                    idDocName = "Police ID";
                    idDocDescription = "PoliceId";
                    break;
                case 'StudentID':
                    idDocName = "Student ID";
                    idDocDescription = "StudentId";
                    break;
                case 'DRCForeignPassport':
                    idDocName = "Foreign Passport";
                    idDocDescription = "ForeignPassport";
                    break;
                case 'DRCRefugeeId':
                    idDocName = "Refugee ID";
                    idDocDescription = "RefugeeId";
                    break;
                default:
                    idDocName = "National ID";
                    idDocDescription = "NationalId";
                    break;
            }
            
            requiredUploads = [
                {
                    name: idDocName,
                    description: idDocDescription,
                    required: true
                }
                // No KRA PIN for DRC
            ];
        } else {
            // For other subsidiaries
            requiredUploads = [
                {
                    name: "National ID",
                    description: "NationalId",
                    required: true
                },
                {
                    name: "KRA PIN Certificate",
                    description: "KRAPin",
                    required: true
                }
            ];
        }
    
        const context = {
            dedupe: {
                idType: agent.idType,
                nationality: agent.nationality,
                countryOfResidence: agent.countryOfResidence,
                refNum: agent.refNum
            },
            requiredUploads: requiredUploads,
            _parent: {
                id: `${this.ticket?.id || ''}`,
                name: "Known Agent",
                title: "Create CIF",
                returnUrl: currentRoute
            }
        };
        let country= this.session.subsidiary.countryCode;
        let countrycode=country.toLocaleLowerCase();
        // const onboardingUrl = new URL('http://localhost:56635');
        const onboardingUrl = new URL(environment.customerOnboardingUrl);
        const search = new URLSearchParams(
            { step: 'Customer Profile', ctx: btoa(JSON.stringify(context)) }
        );
        onboardingUrl.pathname = `/services/onboarding/${countrycode}/individual/cif`;
        onboardingUrl.search = search.toString();
        this.session.routeToUrl(onboardingUrl);
    }

    // Add this code in the completeTicketDocuments method, right after the successful verification
// This would be in the success handler of the verifyBio method call

private verifyBio(ticketId: string, result: any, skipBio: boolean) {
    const bioObj = {
        cif: this.accMgntObj.cif,
        fingerprints: [result.rightFingerPrint]
    };
    
    this.accountService.verifyCustomerBio(ticketId, bioObj, skipBio)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
            (response) => {
                if (!response.successful) {
                    return;
                }
                
                this.toastService.show(
                    this.translateService.instant('TOAST.TITLE'),
                    this.translateService.instant('TOAST.SUCCESSFULLY-ADDED'),
                    MessageBoxType.SUCCESS,
                    5000, undefined, undefined, false
                );

                if (this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
                    this.router.navigateByUrl('dashboard');
                    return;
                }

                const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
                const agentId = this.route.snapshot.queryParams['agentId'];
                
                if (isRestore && agentId) {
                    this.router.navigate(['/services/known-agent'], {
                        queryParams: {
                            restored: 'true',
                            agentId: agentId
                        }
                    });
                    return;
                } else if (!result.searchFlow) {
                    localStorage.setItem('knownAgentDetails', JSON.stringify(this.knownAgentDetails));
                    this.router.navigateByUrl('services/known-agent/successful');
                }
            },
            error => {
                this.toastService.show(
                    this.translateService.instant('TOAST.TITLE-ERROR'), 
                    error.error?.statusMessage, 
                    MessageBoxType.DANGER,
                    5000, undefined, undefined, false
                );
            }
        );
}


    private createTicketKnownAgent() {
        if (this.editAgentNames) {
            this.knownAgentDetails.firstName = this.formValues.firstName;
            this.knownAgentDetails.middleName = this.formValues.middleName;
            this.knownAgentDetails.lastName = this.formValues.lastName;
            this.knownAgentDetails.serialNumber = this.formValues.idSerialNumber;
            this.knownAgentDetails.kraPin = this.session.subsidiary.countryCode !== 'CD' ?
                this.formValues.kraPin :
                null;
        }
    
        // Clean up the address to remove null values
        const address = this.knownAgentDetails.address || '';
        const cleanAddress = address
            .replace(/null/g, '')
            .replace(/,\s+,/g, ',')
            .replace(/\s+/g, ' ')
            .trim() || 'N/A';

        const idType = this.mapIdTypeForAPI(this.knownAgentDetails?.identityDocumentType);
        const idNumber = this.knownAgentDetails?.identityDocumentNumber || this.knownAgentDetails?.customerId;
        if (!idNumber) {
            console.error('No valid ID number found');
            this.toastService.show(
                this.translateService.instant('TOAST.TITLE-ERROR'),
                'No valid ID number found for agent',
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );
            return throwError(() => new Error('No valid ID number found for agent'));
        }
    
        let payload: any = {
            associatedId: uuid(),
            customerId: this.accMgntObj.cif,
            customerName: `${this.accMgntObj.firstName} ${this.accMgntObj.lastName}`?.trim(),
            actionFlow: this.session.subsidiary.countryCode === 'CD' ? 'AddKnownAgentFlowV2' : 'AddKnownAgentFlow',
            addAgent: {
                knowAgenServicetRefrenceId: uuid(),
                title: 'MR',
                accountNumber: this.accMgntObj?.accountsId || '',
                cif: this.knownAgentDetails?.customerId,
                firstName: this.knownAgentDetails?.firstName,
                middleName: this.knownAgentDetails?.middleName || '',
                lastName: this.knownAgentDetails?.lastName,
                primaryEmail: this.formValues.items && this.formValues.items[0]?.email ? this.formValues.items[0].email : '',
                primaryPhoneNumber: {
                    Code: this.formValues.items && this.formValues.items[0]?.code ? `${+this.formValues.items[0].code}` : '',
                    Number: this.formValues.items && this.formValues.items[0]?.mobileNumber ? this.formValues.items[0].mobileNumber : ''
                },
                secondaryEmail: this.formValues.items && this.formValues.items[1]?.email ? this.formValues.items[1].email : '',
                secondaryPhoneNumber: {
                    Code: this.formValues.items && this.formValues.items[1]?.code ? `${+this.formValues.items[1].code}` : '',
                    Number: this.formValues.items && this.formValues.items[1]?.mobileNumber ? this.formValues.items[1].mobileNumber : ''
                },
                idNumber: idNumber,
                idType: idType,
                riskLevel: '',
                riskType: '',
                kraPin: this.subsidiary.countryCode === COUNTRY_CODE.CD ? null : (this.editKraPin ? this.formValues?.kraPin : this.knownAgentDetails?.kraPin),
                address: cleanAddress,
                addressType: this.knownAgentDetails.addressType || 'Mailing',
                assignedFunctionsAndLimit: this.assignedFunctionsObject, 
                ...(this.subsidiary.countryCode === 'CD' && {
                    effectiveDate: this.formValues.effectiveDate
                        ? this.formatEffectiveDate(this.formValues.effectiveDate)
                        : 'N/A'
                }),
            }
        };
    
        if (this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
            payload = { ...payload, ViewProfileTicketId: <string>localStorage.getItem('ticketId') };
        }
        return this.accountService.createTicketKnownAgent(payload);
    }
    

    formatEffectiveDate(dateInput: Date | undefined): string {
        if (!dateInput) {
            throw new Error('Effective date is undefined');
        }
        const date = new Date(dateInput);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    private mapIdTypeForAPI(idType?: string): string {
        
        if (!idType) {
          return this.session.subsidiary.countryCode === 'CD' ? 'NationalId' : 'ID';
        }
        
        let mappedType = '';
        
        if (this.session.subsidiary.countryCode === 'CD') {
          switch (idType) {
            case 'NationalIdentification':
              mappedType = 'NationalId';
              break;
            case 'DRCDriversLicense':
              mappedType = 'DriversLicense';
              break;
            case 'DRCVotersCard':
              mappedType = 'VoterCard'; 
              break;
            case 'DRCPassport':
              mappedType = 'Passport';
              break;
            case 'MilitaryID':
              mappedType = 'MilitaryId';
              break;
            case 'PoliceID':
              mappedType = 'PoliceId';
              break;
            case 'StudentID':
              mappedType = 'StudentId';
              break;
            case 'DRCForeignPassport':
              mappedType = 'ForeignPassport';
              break;
            case 'DRCRefugeeId':
              mappedType = 'RefugeeId';
              break;
            case 'customerid':
              mappedType = 'CustomerID';
              break;
            default:
              mappedType = 'NationalId';
              break;
          }
        } else {
          mappedType = idType.toLowerCase() === 'customerid' ? 'CustomerID' : idType;
        }
        return mappedType;
      }
      
    
    
 
      private completeTicketDocuments(ticketId: any, data: any, result: any) {
        if(this.subsidiary.countryCode === 'CD') {
            const documentIds = this.documentIds;
            this.accountService.submitTransactionDocumentsV2(this.ticket.id, { documentIds })
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        if (res.successful) {
                            this.toastService.show(
                                this.translateService.instant('TOAST.TITLE'),
                                this.translateService.instant('TOAST.DOCUMENTS-SUBMITTED'),
                                MessageBoxType.SUCCESS,
                                5000, undefined, undefined, false
                            );
    
                            if (this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
                                if (result.skipLastStep) {
                                    this.verifyBio(this.ticket?.id, result, false);
                                } else {
                                    this.router.navigateByUrl('dashboard');
                            }
                        } else {
                            const isRestore = this.route.snapshot.queryParams['restore'] === 'true';
                            const agentId = this.route.snapshot.queryParams['agentId'];
                            
                            if (isRestore && agentId) {
                                localStorage.setItem('isAgentRestore', 'true');
                                localStorage.setItem('restoredAgentId', agentId);
                            }
                            
                            this.verifyBio(this.ticket?.id, result, true);
                        }
                    }
                },
                    error: (err) => {
                        if (err?.status === 403 && this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
                            this.router.navigateByUrl('dashboard');
                            return;
                        }
                        
                        this.toastService.show(
                            this.translateService.instant('TOAST.TITLE-ERROR'),
                            err.message || 'Document submission failed',
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                });
        } else {
            this.accountService.submitTransactionDocuments(ticketId, {})
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: (res) => {
                        if (res.successful) {
                            this.toastService.show(
                                this.translateService.instant('TOAST.TITLE'),
                                this.translateService.instant('TOAST.DOCUMENTS-SUBMITTED'),
                                MessageBoxType.SUCCESS,
                                5000, undefined, undefined, false
                            );
    
                            if (this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
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
                    error: (err) => {
                        if (err?.status === 403 && this.accMgntObj.currentFlow === CurrentFlowsOptions.CUSTOMERNOTPRESENT) {
                            this.router.navigateByUrl('dashboard');
                            return;
                        }
                        
                        this.toastService.show(
                            this.translateService.instant('TOAST.TITLE-ERROR'),
                            err.error.statusMessage || 'Document submission failed',
                            MessageBoxType.DANGER,
                            5000, undefined, undefined, false
                        );
                    }
                });
        }
    }
    

    private getAddresses(address: Address[]): string {
        const _address = address.find(a => a.preferred)
        return `${_address?.estate} , ${_address?.location}  ${_address?.subLocation} ${_address?.village} ${_address?.stateProvince} ,  ${_address?.postalCode} `
    }

    private getMaritalStatusDescription(code: string): string {
        if (localStorage.getItem('user-locale')) {
            const locale = JSON.parse(<string>localStorage.getItem('user-locale'));
            this.selectedLanguage = locale.language;
        }else{
            this.selectedLanguage = 'en';
        }
        const maritalStatuses: { [key: string]: string } = {
          '001': this.session.subsidiary.countryCode === 'CD' ? 
                (this.selectedLanguage === 'en' ? 'SINGLE' : 'CELIBATAIRE') : 'SINGLE',
          '002': this.session.subsidiary.countryCode === 'CD' ? 
                (this.selectedLanguage === 'en' ? 'MARRIED' : 'MARIÉ') : 'MARRIED',
          '003': this.session.subsidiary.countryCode === 'CD' ? 
                (this.selectedLanguage === 'en' ? 'SEPARATED' : 'SÉPARÉ') : 'SEPARATED',
          '004': this.session.subsidiary.countryCode === 'CD' ? 
                (this.selectedLanguage === 'en' ? 'DIVORCED' : 'DIVORCÉ') : 'DIVORCED',
          '005': this.session.subsidiary.countryCode === 'CD' ? 
                (this.selectedLanguage === 'en' ? 'WIDOWED' : 'Veuf') : 'WIDOWED'
        };
        return maritalStatuses[code] || code;
      }
      

    private getfunctions() {
        this.accountService.getKnownAgentsFunctions().pipe(takeUntil(this.destroy$)).subscribe(
            functions => this.functionsArray = functions.responseObject);
    }

    private cifCreationNeedApprobal(ticketId: number, ) {

        const dialogRef = this.dialog.open(DialogConfirmComponent, {
            width: '400px',
            height: 'auto',
            data: {
                title: '',
                // pillText: "KNOWN-AGENT.INVALID-DETAILS",
                // bodyDescription: `${this.translateService.instant('KNOWN-AGENT.CANNOT-BE-VERIFIED') }`,
                bodyDescription: `${this.translateService.instant(
                    'KNOWN-AGENT.CIF-CREATION-NEED-APPROVAL', { ticketId })}`,
                // cancelButtonLabel :'COMMON.QUIT',
                 confirmButtonLabel : 'COMMON.CONTINUE'
            }
        });

        dialogRef.afterClosed().subscribe((option: any) => {

            if (option?.confirm) {
                this.ticketService
                                .getTicket(`${ticketId}`).pipe(
                                    takeUntil(this.destroy$)
                                ).subscribe((ticket: any) => {
                                    if (ticket?.status === 'Completed' ) {
                                        this.ngOnInit();
                                    } else {
                                        this.cifCreationNeedApprobal(ticketId);
                                    }
                                });
            } else {
                this.router.navigateByUrl('/services/known-agent');
            }
        });
    }
}
