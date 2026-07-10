import {
  Component,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { UntypedFormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Observable, of, Subject, throwError } from 'rxjs';
import { map, retry, switchMap, takeUntil, tap } from 'rxjs/operators';
import { AccountService } from '@app/core/services/account/account.service';
import { AuditService } from '@app/core/services/audit/audit.service';
import { MessageBoxType } from '@app/shared/modules/toast/models';
import { v4 as uuid } from 'uuid';
import { IAccMgntObj } from '../../models/common';
import { ToastService } from '../../modules/toast';
import { SessionService, UIService } from '../../services';
import { BioVerifyService } from '../../services/bioVerifyStatus.service';
import { TranslateService } from '@ngx-translate/core';
import { SearchComponent } from '@app/home/search/search.component';
import {
  CloneObject,
  ReasonOption,
  ReasonOptionItem,
  ViewProfileTicketPayload,
} from '@shared/models/verify-skip-bio-models';
import {
  ACTIONS_NO_DOCUMENTS_REQUIRED,
  ALLOWED_FILE_TYPES,
  BANKS_REQUIRING_DORMANT_CHECK,
  DEFAULT_REASON_OPTIONS,
  DEV_HOSTNAMES,
  DRC_COUNTRY_CODE,
  MAX_FILE_SIZE,
  REASON_OPTIONS,
  SUPER_USER_WORK_CLASS,
  UPLOAD_DOCUMENTS,
} from '@shared/components/verify-skip-bio/verify-skip-bio.constants';

@Component({
  selector: 'app-verify-skip-bio',
  templateUrl: './verify-skip-bio.component.html',
  styleUrls: ['./verify-skip-bio.component.scss'],
  providers: [SearchComponent],
})
export class VerifySkipBioComponent implements OnInit, OnDestroy {
  @Output() closedSkipBioDialogEvent = new EventEmitter<any>();

  accountData: any;
  cloneOfObjects: CloneObject[] = [];
  selectedReason!: ReasonOption;
  reasonOptionArray: ReasonOptionItem[] = [];
  actionsArray: string[] = [];
  requiredUploadDocument = true;
  dormantAccExists = false;
  countryCode = '';

  readonly UploadDocuments = UPLOAD_DOCUMENTS;
  readonly allowedFileTypes = ALLOWED_FILE_TYPES;

  reasonForm = this.formBuilder.group({
    reason: ['', Validators.required],
    comment: ['', Validators.required],
    action: [''],
  });

  private ticketId!: string;
  private profileArr!: any;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public dialogRef: MatDialogRef<VerifySkipBioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private toastService: ToastService,
    private bioVerifyService: BioVerifyService,
    private accountService: AccountService,
    private uIservice: UIService,
    private sessionService: SessionService,
    private auditService: AuditService,
    private translate: TranslateService
  ) {
    this.reasonOptionArray = this.resolveReasonOptionArray();
  }

  ngOnInit(): void {
    this.accountData = this.data;
    this.ticketId = JSON.parse(localStorage.getItem('ticketId') as string);
    this.countryCode = this.sessionService.subsidiary.countryCode;

    this.listenToActionChanges();
    this.listenToReasonChanges();
    this.loadProfileActions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private listenToActionChanges(): void {
    this.reasonForm.controls.action.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        if (this.isDormantActionBlocked(value)) {
          this.warnDormantAccountBlocked();
          this.reasonForm.controls.action.setValue('', {
            emitEvent: false,
            onlySelf: true,
          });
          return;
        }
        this.requiredUploadDocument = this.isDocumentRequired(value);
      });
  }

  private listenToReasonChanges(): void {
    this.reasonForm.controls.reason.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: ReasonOption) => {
        this.selectedReason = value;
        if (value === ReasonOption.CUSTOMERNOTPRESENT) {
          this.reasonForm.controls.action.addValidators(Validators.required);
          if (this.actionsArray.length === 0) {
            this.loadCustomerNotPresentActions();
          }
        } else {
          this.reasonForm.controls.action.clearValidators();
          this.reasonForm.controls.action.updateValueAndValidity();
        }
      });
  }

  private loadProfileActions(): void {
    this.accountService
      .getProfileActions()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => (this.profileArr = res));
  }

  onSubmit(): void {
    if (this.isContactOrDigitalReason()) {
      localStorage.setItem('show-bio-captured', 'false');
    }

    if (this.isKnownAgentSkipBioWithCustomerNotPresent()) {
      this.bioVerifyService.setBioVerifyDataSubject({
        data: this.data.approvalType,
      });
      this.dialogRef.close();
      return;
    }

    if (this.selectedReason === ReasonOption.CUSTOMERNOTPRESENT) {
      this.createTicket();
      return;
    }

    this.logAuditReason();
    this.closeWithSkipBio();

    if (!this.data?.dontNavigate && !this.data?.doNotRedirectOnSuccess) {
      this.router.navigateByUrl(
        this.data?.user?.url || 'services/customer-360'
      );
    }
  }

  handleDocumentsUploaded(cloneOfObjects: CloneObject[]): void {
    this.cloneOfObjects = cloneOfObjects;
  }

  async filesDropped(files: any): Promise<void> {
    const file = files[0];
    if (!this.isFileSizeValid(file.size)) return;

    const base64 = await this.uIservice.toBase64(file);
    const prefixDocument = this.reasonForm.controls.action.value;
    this.cloneOfObjects.push(
      this.buildCloneObject(file, base64, prefixDocument)
    );
  }

  async onChange(fileInput: any): Promise<void> {
    const file: File = fileInput?.files?.[0] ?? fileInput?.[0];
    if (!file) return;

    if (!this.isFileSizeValid(file.size)) {
      this.showToast('DOCUMENTS.MAX_SIZE_ERROR', MessageBoxType.WARNING, true);
      return;
    }

    if (this.allowedFileTypes && !this.allowedFileTypes.includes(file.type)) {
      this.showToast(
        'DOCUMENTS.UNSUPPORTED_TYPE_ERROR',
        MessageBoxType.WARNING,
        true
      );
      return;
    }

    const base64 = await this.uIservice.toBase64(fileInput.files[0]);
    const prefixDocument = this.reasonForm.controls.action.value;
    this.cloneOfObjects.push(
      this.buildCloneObject(fileInput.files[0], base64, prefixDocument)
    );
  }

  onDRCFileChange(event: any[]): void {
    if (!event[0]?.document?.data) return;

    const file = event[0];
    this.cloneOfObjects = [
      {
        documentName: file?.file?.name,
        documentDescription: file?.file?.name,
        documentFileName: file?.file?.name,
        mandatory: false,
        name: '',
        size: file?.file?.size,
        success: false,
        fileSize: this.fileSizeUnit(file?.file?.size),
        additionalDocument: true,
        document: {
          filename: file?.file?.name,
          format: file?.document?.format,
          DocCode: file?.docCode,
          data: file?.document?.data.replace(/^data:(.*,)?/, ''),
        },
        uploadedFile: {},
      },
    ];
  }

  deleteUpload(object: CloneObject): void {
    this.cloneOfObjects.splice(this.cloneOfObjects.indexOf(object), 1);
  }

  isFormValid(): boolean {
    if (this.selectedReason === ReasonOption.CUSTOMERNOTPRESENT) {
      return this.requiredUploadDocument
        ? this.cloneOfObjects.length > 0 && this.reasonForm.valid
        : this.reasonForm.valid;
    }
    return this.reasonForm.valid;
  }

  closeDialog(): void {
    this.dialogRef.close({ skipBioDialogClosed: true });
    this.dialogRef.afterClosed().subscribe((result: any) => {
      this.closedSkipBioDialogEvent.emit(result);
      this.router.navigate(['/servicesstsrt'], { replaceUrl: true }).then();
    });
  }

  fileSizeUnit(size: number): string {
    const units = ['bytes', 'kb', 'mb', 'gb'];
    const thresholds = [1, 1_000, 1_000_000, 1_000_000_000];

    let i = thresholds.findIndex(
      (t, idx) => size < (thresholds[idx + 1] ?? Infinity)
    );
    i = i === -1 ? units.length - 1 : i;

    return `${Math.trunc(size / thresholds[i])} ${units[i]}`;
  }

  //Helpers
  private isFeatureAccessibleForContactCenter(): boolean {
    return this.sessionService.isDigitalSupportUser();
  }

  private resolveReasonOptionArray(): ReasonOptionItem[] {
    const isContactCenter = this.isFeatureAccessibleForContactCenter();
    const isDRC =
      this.sessionService.subsidiary.countryCode === DRC_COUNTRY_CODE;
    const isDevEnvironment = DEV_HOSTNAMES.has(window.location.hostname);
    const isSuperUser =
      this.sessionService.userWorkClass === SUPER_USER_WORK_CLASS;

    if (isDRC) {
      if (isDevEnvironment) {
        return DEFAULT_REASON_OPTIONS;
      }

      return isContactCenter
        ? [REASON_OPTIONS['DIGITAL_SUPPORT'], REASON_OPTIONS['CONTACT_CENTER']]
        : [REASON_OPTIONS['CUSTOMER_NOT_PRESENT']];
    }

    if (isDevEnvironment) {
      return isSuperUser || isContactCenter
        ? DEFAULT_REASON_OPTIONS
        : [REASON_OPTIONS['CUSTOMER_NOT_PRESENT']];
    }

    return isContactCenter
      ? [REASON_OPTIONS['CONTACT_CENTER'], REASON_OPTIONS['DIGITAL_SUPPORT']]
      : [REASON_OPTIONS['CUSTOMER_NOT_PRESENT']];
  }

  private buildCloneObject(
    file: File,
    base64: string,
    prefix: string
  ): CloneObject {
    const isDRC =
      this.sessionService.subsidiary.countryCode === DRC_COUNTRY_CODE;
    return {
      documentName: file.name,
      documentDescription: file.name,
      documentFileName: file.name,
      mandatory: false,
      name: '',
      size: '',
      success: false,
      fileSize: this.fileSizeUnit(file.size),
      additionalDocument: true,
      document: {
        filename: `${prefix}_${file.name}`,
        format: file.type.split('/')[1],
        data: base64,
        ...(isDRC && { DocCode: '059' }),
      },
      uploadedFile: file,
    };
  }

  private isFileSizeValid(size: number): boolean {
    if (size > MAX_FILE_SIZE) {
      this.showToast('Document too large', MessageBoxType.DANGER);
      return false;
    }
    return true;
  }

  private isDormantActionBlocked(action: string): boolean {
    return (
      this.dormantAccExists && ['StaticDataUpdatePersonal'].includes(action)
    );
  }

  private warnDormantAccountBlocked(): void {
    this.showToast(
      this.translate.instant(
        'TOAST.DORMANT-ACCOUNT-EXISTS-NOT-POSSIBLE-PROCEED'
      ),
      MessageBoxType.WARNING
    );
  }

  private isContactOrDigitalReason(): boolean {
    return (
      this.selectedReason === ReasonOption.CONTACTCENTER ||
      this.selectedReason === ReasonOption.DIGITALSUPPORT
    );
  }

  private isKnownAgentSkipBioWithCustomerNotPresent(): boolean {
    return (
      this.data?.approvalType === 'KNOWNAGENTSKIPBIO' &&
      this.selectedReason === ReasonOption.CUSTOMERNOTPRESENT
    );
  }

  private logAuditReason(): void {
    const reason = this.reasonForm.value.reason;
    this.auditService
      .auditLog(
        {
          EventName: 'ViewCustomerProfile',
          EventDescription: 'View Customer Profile',
          AuditData: JSON.stringify({ reason }),
        },
        true
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.showToast('Reason Saved', MessageBoxType.SUCCESS));
  }

  private closeWithSkipBio(): void {
    this.bioVerifyService.setBioVerifyDataSubject({ data: 'skip-bio' });
    this.dialogRef.close({ data: 'skip-bio', documents: this.cloneOfObjects });
  }

  private isDocumentRequired(action: string): boolean {
    return !ACTIONS_NO_DOCUMENTS_REQUIRED.some((a: any) => a.includes(action));
  }

  private showToast(
    message: string,
    type: MessageBoxType,
    translate = false
  ): void {
    this.toastService.show(
      null,
      message,
      type,
      5000,
      undefined,
      undefined,
      translate
    );
  }

  private createTicket(): void {
    const customer: IAccMgntObj = JSON.parse(
      localStorage.getItem('accMgntObj') as string
    );
    const action = this.reasonForm.controls.action.value;
    const profileViewReason: string = this.reasonForm.controls.comment.value;

    const payload: ViewProfileTicketPayload = {
      associatedId: uuid(),
      customerId: customer.cif,
      customerName: `${customer.firstName} ${customer.lastName}`,
      profileRequestTaskData: {
        accountNumber: customer.accountsId,
        reason: profileViewReason,
        profileViewReason: this.data?.approvalType ?? profileViewReason,
        action,
      },
    };

    this.accountService
      .createCustomerNotPresentViewProfileTicket(payload)
      .pipe(
        map((res: any) => res.responseObject.id.toString()),
        tap((id: string) => {
          this.showToast(
            `Access profile ticket ${id} submitted to Checker successfully!`,
            MessageBoxType.SUCCESS
          );
          localStorage.setItem('ticketId', id);
        }),
        switchMap(id =>
          this.requiredUploadDocument || this.cloneOfObjects.length > 0
            ? this.uploadDocumentsToNewgen(id).pipe(map(() => id))
            : of(id)
        ),
        switchMap(id => this.submitDocuments(id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.showToast(
            'Documents uploaded/submitted successfully',
            MessageBoxType.SUCCESS
          );
          this.bioVerifyService.setBioVerifyDataSubject({ data: 'skip-bio' });
          this.dialogRef.close({ data: 'skip-bio' });
          this.router.navigate(['/dashboard']);
        },
        error: err => console.error(err),
      });
  }

  private uploadDocumentsToNewgen(ticketNumber: string): Observable<any> {
    const accMgntObj: any = JSON.parse(
      localStorage.getItem('accMgntObj') as string
    );
    const docsData = this.cloneOfObjects
      .filter(doc => doc.document !== ('' as any))
      .map(doc => doc.document);

    const isDRC =
      this.sessionService.subsidiary.countryCode === DRC_COUNTRY_CODE;
    const action = this.reasonForm.controls.action.value;

    if (isDRC) {
      return this.accountService.uploadTransactionDocumentsV3(
        {
          processName: 'Customer Onboarding',
          processId: 'Customer Onboarding',
          Service: 'NewGen',
          CIF: accMgntObj.cif,
          branch: accMgntObj.bankID,
          Country: this.sessionService.subsidiary.countryCode,
          ticketNumber,
          idType: accMgntObj.bankID.idType,
          idNumber: accMgntObj.cif,
          documents: docsData,
        },
        action
      );
    }

    return this.accountService.uploadTransactionDocuments(
      {
        CIF: accMgntObj.cif,
        accountNumber: accMgntObj.accountsId,
        country: 'KE',
        ticketNumber,
        idType: 'NationalId',
        idNumber: accMgntObj.idNumber,
        Service: 'NewGen',
        documents: docsData,
      },
      action
    );
  }

  private submitDocuments(ticketId: string): Observable<any> {
    return this.accountService.submitCustomerNotPresentViewProfileTicket(
      ticketId
    );
  }

  private loadCustomerNotPresentActions(): void {
    const customer: any = JSON.parse(
      localStorage.getItem('accMgntObj') as string
    );

    const dormantCheck$ = BANKS_REQUIRING_DORMANT_CHECK.includes(
      customer.bankID
    )
      ? this.getIsAnyDormantAccount(customer)
      : of(false);

    dormantCheck$
      .pipe(
        switchMap(dormantAccExists =>
          this.accountService
            .getCustomerNotPresentActions()
            .pipe(map(res => ({ ...res, dormantAccExists })))
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(res => {
        this.dormantAccExists = res.dormantAccExists;
        this.actionsArray = res.responseObject;
      });
  }

  private getIsAnyDormantAccount(customer: any): Observable<boolean> {
    const url = `?Id=${customer?.cif}&bankId=${customer?.bankID}&idType=customerid`;
    return this.accountService.getAccount(url).pipe(
      switchMap(res => {
        if (!res.successful) {
          this.showToast(
            'CUSTOMER.RETRYING-ACCOUNT-INQUIRY',
            MessageBoxType.WARNING,
            true
          );
          return throwError(() => ({ error: res }));
        }
        return of(res);
      }),
      retry(1),
      map(result => {
        const { accounts, relatedAccounts, cif } = result.responseObject;
        const isMandateJoint = !!accounts.find(
          (x: any) => x.mandate !== 'SELF'
        );
        const dormantAccounts = accounts.filter(
          (x: any) => !isMandateJoint && x.accountStatus === 'D'
        );
        return dormantAccounts.length > 0;
      })
    );
  }
}
