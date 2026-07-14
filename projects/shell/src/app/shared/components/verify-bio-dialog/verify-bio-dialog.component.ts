import { Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { AccountStatementService } from '@app/core/services/account-statement/account-statement.service';
import { AccountService } from '@app/core/services/account/account.service';
import { BiometricService } from '@app/core/services/biometric/biometric.service';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { ChangeOfSignatureService } from '@app/core/services/change-of-signature/change-of-signature.service';
import { CustomerProfileService } from '@app/core/services/customer-profile/customer-profile.service';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { Bio } from '@app/home/customer/account-statements/models/account-statement';
import { SuccessDialogComponent } from '@app/home/customer/cards/success-dialog/success-dialog.component';
import { MessageBoxType } from '@app/shared/modules/toast/models';
import { environment } from '@env/environment.uat';
import { ToastService } from '../../modules/toast';
import { SessionService } from '@app/shared/services/session/session.service';
import { BIO_EXEMPTED_USERS } from '../../static';
import { BioEnrollmentComponent } from '../bio-enrollment/bio-enrollment.component';
import { ImagePreviewModalComponent } from '../customer-information/image-preview-modal/image-preview-modal.component';
import { VerifySkipBioComponent } from '../verify-skip-bio/verify-skip-bio.component';
import { ChequeRequestService } from '@app/core/services/cheque-book-request/cheque-request.service';
import { isDev, isUat } from '../../utils';
import { environment as envProd } from '../../../../environments/environment.prod';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { ChannelsService } from '@app/core/services/channels/channels.service';
import { SchedulePaymentService } from '@app/core/services/schedule-payment/schedule-payment.service';
// import { fi } from "date-fns/locale";
// import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { v1 as uuid } from 'uuid';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { TicketService } from '@app/core/services/ticket/tickets.service';
import { ContextManager } from '@app/shared/modules/stepper';
import { TransactionLimitsService } from '@app/core/services/transaction-limits/transaction-limits.service';
import { AccountSelectionService } from '@app/core/services/account-selection/account-selection.service';
import { NotificationPreferencesService } from '@app/core/services/notification-preferences.service';
import { LoaderService } from '@app/shared/modules/loader';
export interface VerifyBioData {
  isForiegnDraft: any;
  isForiegnDraftRequest?: any;
  isBankerRequest?: any;
  accepted: boolean;
  cardLimit: boolean;
  flow: string;
  activateDormantAccount: boolean;
  customerManagement: boolean;
  fundsTransfer: boolean;
  standingOrder: boolean;
  firstName: string;
  lastName: string;
  hideSkipBio: boolean;
  callBack: boolean;
  skipFunction: any;
  dontNavigate?: boolean;
  user: any;
  searchFlow: boolean;
  issueCheque: boolean;
  knownAgent: boolean;
  inProcess: boolean;
  mandates: any[];
  cif: string;
  ticketId: string;
  changeOfMandate: boolean;
  newChequeRequest: boolean;
  changeOfSignature: boolean;
  changeOfSignatories: boolean;
  customerInformation: any;
  customerRegistration: boolean;
  customerProfile: boolean;
  deposit?: boolean;
  doNotRedirectOnSuccess?: boolean;
  doNotOpenSkipModal?: boolean;
  generateStatement: boolean;
  generateBalance: boolean;
  actions?: string;
  approvalType?: string;
  softDelete: boolean;
  limitAmendment: boolean;
  restrictAccount: boolean;
  schedulePayment: boolean;
  schedulePaymentAction: string;
  notificationPrefSetting: boolean;
  dormantAccounts?: any;
  account?: string;
  documents?: any;
}

@Component({
  selector: 'app-verify-bio-dialog',
  templateUrl: './verify-bio-dialog.component.html',
  styleUrls: ['./verify-bio-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class VerifyBioDialogComponent implements OnInit, OnDestroy {
  @Input() dormantAccounts: any = [];
  firstName!: string;
  lastName!: string;
  fingerPrintFirstName!: string;
  fingerPrintLastName!: string;
  payload: any;

  accountData: any;
  code: any;
  state: any;

  makeActive: boolean = false;
  rightIndexObj: any;
  bioOverrideActivated: boolean = false;
  rt_index: any;
  right_index_verified = new UntypedFormControl('');
  editor: any;
  editorBtn: any = '';
  enrollType: any;
  @ViewChild('RIGHT_INDEX_1', { read: ElementRef })
  right_index_finger!: ElementRef;
  externalWindow: any;
  cif: any;
  dataFromVerifyAuth: any;
  CIF: any;
  secugenLicenseStr: any;
  defaultImage = 'assets/images/fingerprint-icon.png';
  // icon-fingerprint-captured
  @Output() verifyBioData: EventEmitter<any> = new EventEmitter<any>();
  verified: boolean = false;
  verifyBioObj: any = [];
  showAccounts: boolean = false;
  isSubmitting = false;

  submissionAccountsArray: any = [];
  customerData: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  customerCifData = JSON.parse(<string>localStorage.getItem('customerCifData'));

  private destroy$ = new Subject();
  public customerPhotos: any;
  photoLoading: boolean = false;
  filterAcc: any;
  requiredValues: string[] = ['031', '034', '035', '145', '146', '139'];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VerifyBioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VerifyBioData,
    private toast: ToastService,
    private router: Router,
    private bs: BiometricService,
    private accountService: AccountService,
    private changeMandateService: ChangeMandateService,
    private chequeBookService: ChequeRequestService,
    private changeOfSignatureService: ChangeOfSignatureService,
    private moveMoneyService: MoveMoneyService,
    private customerService: CustomerService,
    private toastService: ToastService,
    private customerProfileService: CustomerProfileService,
    private sessionService: SessionService,
    private domSanitizer: DomSanitizer,
    private accountStatementService: AccountStatementService,
    private standingOrderService: StandingOrderService,
    private channelsService: ChannelsService,
    private schedulePaymentService: SchedulePaymentService,
    private ticketService: TicketService,
    public ctxManager: ContextManager,
    private transactionLimitService: TransactionLimitsService,
    private accountSelectionService: AccountSelectionService,
    private notificationPreferenceSrv: NotificationPreferencesService,
    private loaderService: LoaderService
  ) {}

  ngOnInit() {
    this.accountData = this.data;

    this.setUserBioInfo();

    this.showAccounts = this.data?.user?.accounts?.length !== 0;

    this.submissionAccountsArray =
      this.data?.dormantAccounts?.length > 0 ? this.data?.dormantAccounts : [];

    this.filterAcc =
      this.data?.user?.accounts?.filter(
        (account: any) => account.mandate === 'SELF'
      ) || [];

    if (this.data?.flow === 'customerSearch' && this.showAccounts) {
      this.fetchCustomerImages(
        this.data?.user?.cif,
        this.filterAcc[0]?.accountNumber
      );
    }

    // Subscribe to account selection changes for signatory operations
    if (this.data?.changeOfSignatories) {
      this.accountSelectionService['selectedAccount$']
        .pipe(takeUntil(this.destroy$))
        .subscribe((selectedAccount: any) => {
          if (selectedAccount && this.showAccounts) {
            // Update account-specific data when account changes
            const updatedFilterAcc =
              this.data?.user?.accounts?.filter(
                (account: any) =>
                  account.accountNumber === selectedAccount.accountNumber
              ) || [];
            if (updatedFilterAcc.length > 0) {
              this.filterAcc = updatedFilterAcc;
            }
          }
        });
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  isFeatureAccessibleForContactCenter() {
    return this.sessionService.hasRole('AccountManagement.EfrontUser');
  }

  closeDialog(): void {
    this.dialogRef.close({
      bioDialogClosed: true,
    });
  }
  showBioInterface(): boolean {
    if (
      (window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
        window.location.hostname ===
          'servicehub-customer-360-uat.equitygroupholdings.com' ||
        window.location.hostname === 'localhost') &&
      this.isFeatureAccessibleForContactCenter()
    ) {
      return false;
    } else return this.isFeatureAccessibleForContactCenter();
  }

  setAccepted(): void {
    this.data.accepted = true;
  }

  fetchCustomerImages = (cif: any, accId: string) => {
    this.photoLoading = true;
    this.accountService
      ['fetchPhoto'](
        {
          customerId: cif,
          accountid: accId,
        },
        'v1',
        { headers: { skipLoadingInterceptor: 'true' } }
      )
      .subscribe((result: any) => {
        this.photoLoading = false;
        if (result.successful) {
          this.toastService.show(
            'COMMON.SUCCESS',
            'CUSTOMER.SEARCH.PHOTO-FETCHED',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            true
          );
        }
        if (!result.successful) {
          this.toastService.show(
            '',
            result.statusMessage,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }
        const images = result.responseObject;
        // TODO::Q: Does the mandate filtering work with DRC nice?
        // filters the images of known-agents and individual owners of the accounts

        const filteredImages: any[] = images.filter(
          (x: any) =>
            this.compareStrings(
              x.customerNameField.trim(),
              this.data?.mandates[0]?.customerName.trim()
            ) ||
            x.remarksField.trim() === '' ||
            (x.customerNameField.trim() === '' && x.remarksField.trim())
        );

        this.mapImages([filteredImages[0]]);
      });
  };

  compareStrings(str1: string, str2: string) {
    const sortedStr1 = str1.split(' ').sort().join(' ');
    const sortedStr2 = str2.split(' ').sort().join(' ');
    return sortedStr1 === sortedStr2;
  }

  mapImages = (images: any) => {
    if (images.length > 0) {
      this.customerPhotos = images.map((v: any) => {
        return {
          photo: v?.returnedPhotographFiels
            ? this.domSanitizer.bypassSecurityTrustUrl(
                'data:image/jpeg;base64,' + v?.returnedPhotographFiels
              )
            : this.domSanitizer.bypassSecurityTrustUrl(
                'data:image/jpeg;base64,' + v?.returnedSignatureField
              ),
          signaturePhoto: this.domSanitizer.bypassSecurityTrustUrl(
            'data:image/jpeg;base64,' + v?.returnedSignatureField
          ),
        };
      });
    } else if (images.length === 0) {
      this.customerPhotos = null;
    }
  };

  displayImageModal = (source: any) => {
    const dialogRef = this.dialog.open(ImagePreviewModalComponent, {
      width: '600px',
    });

    dialogRef.componentInstance.imageSource = source;
  };

  private setUserBioInfo(): void {
    switch (this.data?.user?.actions) {
      case 'removeAgent':
        this.firstName = this.data.user
          ? this.data.user?.agentFirstName
          : this.accountData.user.firstName;
        this.lastName = this.data.user
          ? this.data.user?.agentLastName
          : this.accountData.user.lastName;
        this.fingerPrintFirstName = this.data.user
          ? this.data.user?.firstName
          : this.accountData.user.firstName;
        this.fingerPrintLastName = this.data.user
          ? this.data.user?.lastName
          : this.accountData.user.lastName;
        break;
      case 'addAgent':
        this.fingerPrintFirstName = this.data.user
          ? this.data.user?.agentFirstName
          : this.accountData.user.firstName;
        this.fingerPrintLastName = this.data.user
          ? this.data.user?.agentLastName
          : this.accountData.user.lastName;
        this.firstName = this.data.user
          ? this.data.user?.firstName
          : this.accountData.user.firstName;
        this.lastName = this.data.user
          ? this.data.user?.lastName
          : this.accountData.user.lastName;
        break;
      default:
        this.fingerPrintFirstName = this.firstName = this.data.user
          ? this.data.user?.firstName
          : this.accountData.user.firstName;
        this.fingerPrintLastName = this.lastName = this.data.user
          ? this.data.user?.lastName
          : this.accountData.user.lastName;
        break;
    }
  }

  verifyUser() {
    if (!this.data.accepted) return;

    if (this.data.customerManagement) {
      this.openSuccessToast();
    } else if (this.data.accepted) {
      this.dialogRef.close({ data: this.data.accepted });
    }
  }

  openSuccessDialog() {
    this.dialogRef.close();
    const dialogRef = this.dialog.open(SuccessDialogComponent);
  }

  openSuccessPage() {
    this.dialogRef.close();

    this.router.navigateByUrl('/services/funds-transfer/success');
  }

  openCallback(event: MatCheckboxChange) {
    this.verifyBioData.emit();
    this.dialogRef.close({
      data: this.data.accepted,
      skipped: event.checked,
    });
  }

  onClickVerifyChangeOfMandate() {
    let bioModels: any = [
      {
        cif: this.data.user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      },
    ];

    this.changeMandateService
      ['bioVerify'](this.data.cif, this.data.ticketId, bioModels)
      .subscribe(
        (response: any) => {
          this.dialogRef.close({ data: this.data.accepted });
        },
        (error: any) => {
          this.dialogRef.close();
        }
      );
  }
  onClickVerifyChangeOfSignatories() {
    const actionFlow = this.ctxManager.currentContextData.ticket.actionFlowName;
    const ticketId = this.ctxManager.currentContextData.ticket.ticketId;

    let bioModels: any = [
      {
        cif: this.data.user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      },
    ];

    this.changeMandateService['bioVerifyV2'](ticketId, actionFlow, bioModels)
      .subscribe(
        (response: any) => {
          this.dialogRef.close({ data: this.data.accepted, success: true });
        },
        (error: any) => {
          this.dialogRef.close({ success: false });
        }
      );
  }

  onClickVerifyChequeNewRequest() {
    const ticket = JSON.parse(localStorage.getItem('ticket') || '{}');
    const actionFlow = ticket?.actionFlowName;
    const ticketId = ticket?.ticketId;

    let bioModels: any = [
      {
        cif: this.data.user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      },
    ];

    this.changeMandateService['bioVerifyV2'](ticketId, actionFlow, bioModels)
      .subscribe(
        (response: any) => {
          this.dialogRef.close({ data: this.data.accepted });
        },
        (error: any) => {
          this.dialogRef.close();
        }
      );
  }

  onVerifyMoveMoney() {
    let bioModels: any = {
      cif: this.data.user.cif,
      fingerprints: [this.rightIndexObj],
    };
    this.moveMoneyService['verifyCustomerBio'](this.data.ticketId, bioModels)
      .subscribe((response: any) => {
        if (!response.successful) {
          this.toast.show(
            'Funds transfer',
            response.statusMessage,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }
        this.dialogRef.close({ data: this.data.accepted });
      });
  }

  onClickVerifyNewChequeRequest() {
    if (this.data.isForiegnDraft) {
      this.chequeBookService['bioVerifyForeignDraftRequest'](this.data.cif, this.data.ticketId, this.rightIndexObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            if (!response) {
              this.toast.show(
                '  Request',
                response.statusMessage,
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
              return;
            }
            if (response) {
              return this.dialogRef.close({
                data: this.data.accepted,
                success: true,
              });
            }
          },
          (error: any) => {
            this.dialogRef.close();
          }
        );
    } else if (this.data.isForiegnDraftRequest || this.data.issueCheque) {
      let payloadData = JSON.parse(
        <string>localStorage.getItem('ChequeRequest')
      );
      let payload = {
        Id: payloadData.id,
        CIF: payloadData.cif,
        Fingerprints: [this.rightIndexObj],
      };

      this.chequeBookService['issue'](payload).subscribe((result: any) => {
        this.chequeBookService['setChequeSuccessData'](payloadData);
        this.router.navigate(['/services/cheque-requests/success']);
      });
      this.dialogRef.close();
    } else if (this.data.isBankerRequest) {
      this.chequeBookService
        ['bioVerifyBankerChequeRequest'](
          this.data.cif,
          this.data.ticketId,
          this.rightIndexObj
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            if (!response.successful) {
              this.toast.show(
                'Cheque Request',
                response.statusMessage,
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                false
              );
              return;
            }
            if (response.successful) {
              return this.dialogRef.close({
                data: this.data.accepted,
                success: true,
              });
            }
          },
          (error: any) => {
            this.dialogRef.close();
          }
        );
    }
  }

  onVerifyCustomerRegistration() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: false,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });
    this.customerService['sendCustomerRegistrationRequest'](customerDataObj)
      .subscribe(
        (res: any) => {
          if (!res.successful) return;
          this.toast.show(
            'Action submitted successfully',
            '',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            false
          );
          this.dialogRef.close({
            data: this.data.accepted,
            success: true,
          });
        },
        (err: any) => {
          // this.toast.show(err, "", MessageBoxType.DANGER);
        }
      );
  }

  onVerifyCustomerProfile() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: false,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });

    this.customerProfileService['updateCustomerProfile'](customerDataObj)
      .subscribe(
        (res: any) => {
          if (!res.successful) return;
          this.toast.show(
            'Action submitted successfully',
            '',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            false
          );
          this.dialogRef.close({
            data: this.data.accepted,
            success: true,
          });
        },
        (err: any) => {
          // this.toast.show(err, "", MessageBoxType.DANGER);
        }
      );
  }

  onVerifySoftDeleteProfile() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };
    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });

    this.customerProfileService['softDeleteProfile'](customerDataObj).subscribe(
      (res: any) => {
        if (!res.successful) return;
        this.toast.show(
          'Action submitted successfully',
          '',
          MessageBoxType.SUCCESS,
          5000,
          undefined,
          undefined,
          false
        );
        this.dialogRef.close({
          data: this.data.accepted,
          response: res,
        });
      },
      (err: any) => {
        // this.toast.show(err, "", MessageBoxType.DANGER);
      }
    );
  }

  onVerifyLimitAmendment() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj = {
      ...this.data.customerInformation,
      bioModel: bioModels,
    };

    this.transactionLimitService['amendLimitPersonalisationSettings'](customerDataObj)
      .subscribe({
        next: (res: any) => {
          if (!res.successful) return;
          this.toast.show(
            'Action submitted successfully',
            '',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            false
          );
          this.dialogRef.close({
            data: this.data.accepted,
            response: res,
          });
        },
        error: () => {},
      });
  }

  onVerifyRestrictAccount() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };
    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });

    this.channelsService['restrictChannelAccount'](customerDataObj).subscribe(
      (res: any) => {
        if (!res.successful) return;
        this.toast.show(
          '',
          'Action submitted successfully',
          MessageBoxType.SUCCESS,
          5000,
          undefined,
          undefined,
          false
        );

        this.dialogRef.close({
          data: this.data.accepted,
          response: res,
        });
      },
      (err: any) => {
        // this.toast.show(err, "", MessageBoxType.DANGER);
      }
    );
  }

  onVerifySchedulePayment() {
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: false,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });

    if (this.data.schedulePaymentAction === 'cancel') {
      this.schedulePaymentService['cancelSchedulePayment'](customerDataObj)
        .subscribe(
          (res: any) => {
            if (!res.successful) return;
            this.toast.show(
              'Cancellation Request sent for approval successfully!',
              '',
              MessageBoxType.SUCCESS,
              5000,
              undefined,
              undefined,
              false
            );
            this.dialogRef.close({
              data: this.data.accepted,
              response: res,
            });
          },
          (err: any) => {
            // this.toast.show(err, "", MessageBoxType.DANGER);
          }
        );
    } else {
      this.schedulePaymentService['updateSchedulePayment'](customerDataObj)
        .subscribe(
          (res: any) => {
            if (!res.successful) return;
            this.toast.show(
              'Update request sent for approval successfully!',
              '',
              MessageBoxType.SUCCESS,
              5000,
              undefined,
              undefined,
              false
            );
            this.dialogRef.close({
              data: this.data.accepted,
              response: res,
            });
          },
          (err: any) => {
            // this.toast.show(err, "", MessageBoxType.DANGER);
          }
        );
    }
  }

  openSuccessToast() {
    this.dialogRef.close();
    this.toast.show(
      'Action submitted successfully',
      '',
      MessageBoxType.SUCCESS,
      5000,
      undefined,
      undefined,
      false
    );
    this.router.navigateByUrl('/dashboard');
  }

  // skipBio() {
  //   this.payload.skipFunction;
  // }

  launchBio() {
    let url = (environment as any).bioExtPage;
    window.open(url, '_blank');
  }

  enrollBio() {
    this.dialogRef.close({ data: 'bioEnrollment' });

    const dialogRef = this.dialog.open(BioEnrollmentComponent, {
      data: {
        user: this.data.user,
      },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
          data: {
            searchFlow: this.data?.searchFlow,
            user: this.data.user,
          },
        });
      }
    });
  }

  skipBio() {
    this.dialogRef.close({
      data: 'skipBio',
      searchFlow: this.data?.searchFlow,
    });

    //if is true not open VerifySkipBioComponent in this instance
    if (this.data?.doNotOpenSkipModal) {
      return;
    }

    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        approvalType: this.data?.approvalType ? this.data?.approvalType : null,
        knownAgent: this.data.knownAgent,
        dontNavigate: this.data.dontNavigate,
        searchFlow: this.data?.searchFlow,
        user: this.data.user,
        doNotRedirectOnSuccess: this.data.doNotRedirectOnSuccess,
      },
    });
    if (this.data?.standingOrder) {
      dialogRef.close();
      return;
    }

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result) {
          const dialogRef = this.dialog.open(VerifyBioDialogComponent, {
            data: {
              searchFlow: this.data?.searchFlow,
              user: this.data.user,
            },
          });
        }
      });
  }

  captureFingerPrint() {
    let uriString: any;
    this.data.accepted = false;
    if (isDev()) {
      uriString = 'timeout=10000&quality=75&licstr=';
    } else if (isUat()) {
      this.secugenLicenseStr = (environment as any).secugenLicenseUAT;
      uriString =
        'timeout=10000&quality=50&licstr=' +
        encodeURIComponent(this.secugenLicenseStr) +
        '&srvhandle=&FingerPos=RIGHT_INDEX';
    } else {
      // use this for production once the license is ready
      this.secugenLicenseStr = (envProd as any).secugenLicenseProd;
      uriString =
        'timeout=10000&quality=50&licstr=' +
        encodeURIComponent(this.secugenLicenseStr) +
        '&srvhandle=&FingerPos=RIGHT_INDEX';
    }

    let bioObj = {
      position: '',
      image: {
        format: '',
        resolutionDpi: '',
        data: '',
      },
    };

    // used to by pass bio on localhost and dev url
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname === 'localhost' ||
      BIO_EXEMPTED_USERS.includes(
        this.sessionService.currentUser.username?.toLowerCase()
      )
    ) {
      this.editorBtn = 'activate';
      // return mock obj
      this.rightIndexObj = {
        position: 'RIGHT_INDEX',
        image: {
          format: 'BMP',
          resolutionDpi: 508,
          data: '/6D/qAB6TklTVF9DT00gOQpQSVhfV0lEVEggMjU4ClBJWF9IRUlHSFQgMzM2ClBJWF9ERVBUSCA4ClBQSSA1MDgKTE9TU1kgMQpDT0xPUlNQQUNFIEdSQVkKQ09NUFJFU1NJT04gV1NRCldTUV9CSVRSQVRFIDAuNzUwMDAw/6gACVNlY3VHZW7/pAA6CQcACTLTJc0ACuDzGZoBCkHv8ZoBC44nZM0AC+F5ozMACS7/VgABCvkz0zMBC/KHIZoACiZ32jP',
        },
      };
      this.defaultImage = 'assets/images/captured-fingerprint.png';
      this.activateBtn(this.rightIndexObj);
      let fingersObj = {
        cif: this.data.user?.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      };
      this.verifyBioObj.push(fingersObj);
      this.setAccepted();
    } else {
      this.bs['postMultipleCapture'](uriString).subscribe((v: any) => {
        if (v.ErrorCode === 0) {
          if (v.ImageQuality < 50) {
            this.toast.show(
              'Finger Print Quality is less than 50',
              '',
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
            this.right_index_finger.nativeElement.src =
              'assets/img/Group 5@3x.png';
          } else {
            this.right_index_finger.nativeElement.src =
              'data:image/bmp;base64,' + v.BMPBase64;
            this.rt_index = v.BMPBase64;
            bioObj.position = 'RIGHT_INDEX';
            bioObj.image.format = 'BMP';
            bioObj.image.resolutionDpi = v.ImageDPI;
            bioObj.image.data = v.BMPBase64;
            this.editorBtn = 'activate';
            this.rightIndexObj = bioObj;
            this.makeActive = false;
            this.activateBtn(this.rightIndexObj);
            this.setAccepted();
          }
        } else if (v.ErrorCode === 54) {
          // timeout error
          //TODO: show alert for time out error
          this.right_index_finger.nativeElement.src =
            'assets/img/Group 5@3x.png';
          this.editorBtn = 'deactivate';
          this.toast.show(
            'Secugen Bio Error: ',
            this.biometricsErrorCodes(v.ErrorCode),
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            false
          );
          this.data.accepted = false;
        } else if (v.ErrorCode !== 54 && v.ErrorCode !== 0) {
          this.data.accepted = false;
          this.toast.show(
            'Secugen Bio Error: ',
            this.biometricsErrorCodes(v.ErrorCode),
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
        // no finger error
      });
      this.data.accepted = false;
    }
  }

  biometricsErrorCodes = (ErrorCode: any) => {
    let Description;
    switch (ErrorCode) {
      // 0 - 999 - Comes from SgFplib.h
      // 1,000 - 9,999 - SGIBioSrv errors
      // 10,000 - 99,999 license errors
      case 1:
        Description =
          'Creation failed (fingerprint reader not correctly installed or driver files error)';
        break;
      case 2:
        Description =
          'Function failed (wrong type of fingerprint reader or not correctly installed)';
        break;
      case 3:
        Description = 'Internal (invalid parameters to sensor API)';
        break;
      case 5:
        Description = 'DLL load failed';
        break;
      case 6:
        Description = 'DLL load failed for driver';
        break;
      case 7:
        Description = 'DLL load failed for algorithm';
        break;
      case 51:
        Description = 'System file load failure';
        break;
      case 52:
        Description = 'Sensor chip initialization failed';
        break;
      case 53:
        Description = 'Device not found';
        break;
      case 54:
        Description = 'Fingerprint image capture timeout';
        break;
      case 55:
        Description = 'No device available';
        break;
      case 56:
        Description = 'Driver load failed';
        break;
      case 57:
        Description = 'Wrong Image';
        break;
      case 58:
        Description = 'Lack of bandwidth';
        break;
      case 59:
        Description = 'Device Busy';
        break;
      case 60:
        Description = 'Cannot get serial number of the device';
        break;
      case 61:
        Description = 'Unsupported device';
        break;
      case 63:
        Description = "SgiBioSrv didn't start; Try image capture again";
        break;
      case 101:
        Description = 'Very low minutiae count';
        break;
      case 102:
        Description = 'Wrong template type';
        break;
      case 103:
        Description = 'Invalid template';
        break;
      case 104:
        Description = 'Invalid template';
        break;
      case 105:
        Description = 'Could not extract features';
        break;
      case 106:
        Description = 'Match failed';
        break;
      case 1000:
        Description = 'No memory';
        break;
      case 2000:
        Description = 'Internal error';
        break;
      case 3000:
        Description = 'Internal error extended';
        break;
      case 4000:
        Description = 'Invalid parameter passed to service';
        break;
      case 6000:
        Description = 'Certificate error cannot decode';
        break;
      case 10001:
        Description = 'License error';
        break;
      case 10002:
        Description = 'Invalid domain';
        break;
      case 10003:
        Description = 'License expired';
        break;
      case 10004:
        Description =
          'WebAPI may not have received the origin header from the browser';
        break;
      default:
        Description =
          'Unknown error code or Update code to reflect latest result';
        break;
    }
    return Description;
  };

  activateBtn(indexObj: any) {
    // this.verifyBioData.emit(this.rightIndexObj);
    // this.dialog.closeAll();
    const bioObj = {
      cif: this.data.user.cif,
      fingerprints: [indexObj],
      CheckerOauth: {},
    };
    if (
      window.location.hostname ===
        'branchservicehub-customer-360-dev.azurewebsites.net' ||
      window.location.hostname === 'localhost' ||
      BIO_EXEMPTED_USERS.includes(
        this.sessionService.currentUser.username?.toLowerCase()
      )
    ) {
      this.toast.show(
        'COMMON.ACCOUNT-VERIFIED-SUCCESSFULLY',
        '',
        MessageBoxType.SUCCESS,
        5000,
        undefined,
        undefined,
        true
      );
      localStorage.setItem('show-bio-captured', 'true');
      this.verified = true;
    } else {
      this.verified = true;
    }
  }

  continue() {
    this.isSubmitting = true;
    this.loaderService.suppressLoader = true;
    let bioObj: any = {
      cif: this.data.user.cif,
      fingerprints: [this.rightIndexObj],
      CheckerOauth: {},
    };

    if (this.data.changeOfMandate) {
      this.onClickVerifyChangeOfMandate();
      return;
    } else if (this.data.changeOfSignatories) {
      this.onClickVerifyChangeOfSignatories();
      return;
    } else if (this.data.newChequeRequest) {
      this.onClickVerifyChequeNewRequest();
      return;
    } else if (this.data.changeOfSignature) {
      this.onChangeofSignatureBioVerify();
      return;
    } else if (this.data.fundsTransfer) {
      this.onVerifyMoveMoney();
      return;
    } else if (this.data.customerRegistration) {
      this.onVerifyCustomerRegistration();
      return;
    } else if (this.data.customerProfile) {
      this.onVerifyCustomerProfile();
      return;
    } else if (this.data.generateBalance) {
      this.onVerifyGenerateBalance();
      return;
    } else if (this.data.knownAgent) {
      this.onVerifyKnownAgent();
      return;
    } else if (this.data.generateStatement) {
      this.onVerifyGenerateStatement();
      return;
    } else if (this.data.deposit) {
      this.dialogRef.close({ data: this.data.accepted, bio: bioObj });
      if (
        this.data?.dontNavigate === true ||
        this.data?.doNotRedirectOnSuccess === true
      ) {
        return;
      } else {
        this.router.navigateByUrl('services/customer-360');
      }
    } else if (this.data.activateDormantAccount) {
      this.onActivateDormantAccount(this.data.account);
      return;
    } else if (this.data.standingOrder) {
      this.onVerifyStandingOrder();
      return;
    } else if (this.data.softDelete) {
      this.onVerifySoftDeleteProfile();
      return;
    } else if (this.data.limitAmendment) {
      this.onVerifyLimitAmendment();
      return;
    } else if (this.data?.restrictAccount) {
      this.onVerifyRestrictAccount();
      return;
    } else if (this.data.schedulePayment) {
      this.onVerifySchedulePayment();
      return;
    } else if (this.data.notificationPrefSetting) {
      this.onVerifyNotificationPreferenceSettings();
    } else {
      this.onVerifyAccount(bioObj);
      return;
    }

    if (this.data.doNotRedirectOnSuccess === undefined) {
      return;
    } else if (
      !this.data.doNotRedirectOnSuccess &&
      this.verified &&
      this.submissionAccountsArray.length < 1 &&
      this.data.flow !== 'customerSearch'
    ) {
      //this.dialogRef.close();

      this.router.navigateByUrl('services/customer-360');
    }
  }

  onVerifyAccount(bioObj: any): void {
    this.accountService['verifyAccount'](bioObj).subscribe({
      next: (v: any) => {
        if (!v.successful) return this.dialogRef.close();
        if (v.successful) {
          this.toast.show(
            'COMMON.ACCOUNT-VERIFIED-SUCCESSFULLY',
            '',
            MessageBoxType.SUCCESS,
            5000,
            undefined,
            undefined,
            true
          );

          this.verified = true;

          localStorage.setItem('show-bio-captured', 'true');

          // Submit Dormant Accounts for submission here
          if (this.submissionAccountsArray.length > 0) {
            if (![54].includes(+this.sessionService.subsidiary.bankId)) {
              this.dialogRef.close({
                data: this.data.accepted,
                fingerPrint: bioObj,
                bioDialogClosed: true,
              });

              this.router.navigate(['/services/customer-360']);
              return;
            }
            // pilot this feature for few branches
            // if (window.location.hostname === "servicehub-customer-360-prod.equitygroupholdings.com"
            //     && this.requiredValues.includes(this.sessionService.userBranch)
            //     && ['54'].includes(this.sessionService.userBank)) {
            if (
              window.location.hostname ===
                'servicehub-customer-360-prod.equitygroupholdings.com' &&
              ['54'].includes(this.sessionService.userBank)
            ) {
              this.activateDormantAccounts();
            } else {
              this.router.navigate(['/services/customer-360']);
            }

            if (
              window.location.hostname ===
                'servicehub-customer-360-uat.equitygroupholdings.com' ||
              (window.location.hostname === 'localhost' &&
                ['54'].includes(this.sessionService.userBank))
            ) {
              this.activateDormantAccounts();
            } else {
              this.router.navigate(['/services/customer-360']);
            }

            return false;
          } else {
            this.dialogRef.close({
              data: this.data.accepted,
              fingerPrint: bioObj,
              bioDialogClosed: true,
            });
          }

          // this.dialogRef.close();
        } else {
          this.toast.show(
            'Bio not verified',
            '',
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
        }
      },
      error: (_err: any) => {
        this.dialogRef.close({ bioDialogClosed: false });
        this.toast.show(
          'Bio not verified',
          '',
          MessageBoxType.DANGER,
          50000,
          undefined,
          undefined,
          false
        );
        console.log(_err);
        return;
      },
    });
  }

  /** Activate Accounts - Submit multiple dormant accounts for  activation
   * 1. Get value of all dormant accounts as an array
   * 2. Submit details to account service
   * 3. Subscribe to response and redirect user based on success  or failure
   *
   */

  activateDormantAccounts() {
    this.accountService['activateDormantAccounts'](
        this.submissionAccountsArray,
        this.data?.user?.cif
      )
      .subscribe(
        (res: any) => {
          if (res.successful) {
            this.dialogRef.close();

            this.toastService.show(
              '',
              'Account activation request successful',
              MessageBoxType.SUCCESS,
              50000,
              undefined,
              undefined,
              false
            );

            this.router.navigate(['/services/customer-360']);
          } else {
            this.toastService.show(
              '',
              'Error submitting dormant account activation',
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
          }
        },
        (error: any) => {
          this.dialogRef.close();
          this.toastService.show(
            '',
            error?.error?.statusMessage,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
        }
      );
  }

  onVerifyGenerateBalance() {
    return this.dialogRef.close({
      data: this.data.accepted,
      rightFingerPrint: this.rightIndexObj,
    });
  }

  onVerifyKnownAgent() {
    return this.dialogRef.close({
      data: this.data.accepted,
      rightFingerPrint: this.rightIndexObj,
    });
  }

  onActivateDormantAccount(account: any) {
    let ticketId = localStorage.getItem('ticketId') || '';
    const action = 'ActivateAccount';
    let taskData: any = {};

    if (localStorage.getItem('AccActivateTaskData')) {
      taskData = localStorage.getItem('AccActivateTaskData');

      taskData = JSON.parse(taskData);
    }

    const bioModels = [
      {
        cif: this.data.user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      },
    ];
    // Check if documents exist and have data
    if (
      this.data.documents &&
      this.data.documents.some(
        (doc: { document: { data: any } }) => doc.document?.data
      )
    ) {
      const getUploads = this.data.documents.map((docs: IUploadedDocument) => ({
        ...docs.document,
        filename: docs?.document.filename,
        docCode: docs?.document?.docCode,
        description: docs?.description,
      }));

      getUploads.forEach(
        (docs: { data: string }) => (docs.data = docs.data?.split(',')[1])
      );

      //check if the filename or data is empty
      const validUploads = getUploads.filter(
        (doc: { filename: string; data: string }) =>
          doc.filename?.trim() && doc.data?.trim()
      );

      const dataNewGen = {
        CIF: this.data.user.cif,
        AccountNumber: account,
        Country: this.data.user?.preferredAddress?.country,
        ticketNumber: ticketId,
        idType: this.data.user?.preferredDocDesc,
        Service: taskData?.DocumentData?.Service || 'Blob',
        documents: validUploads,
        ProcessName: taskData?.DocumentData?.ProcessName,
        idNumber: this.data.user?.prefDocumentID,
      };

      // Upload documents and verify
      this.accountService['uploadTransactionDocumentsV3'](dataNewGen, action)
        .pipe(
          switchMap((res: any) => {
            if (res.successful) {
              return this.accountService['verifyDormantAcc'](ticketId, bioModels)
                .pipe(
                  map((verifyRes: any) => {
                    if (verifyRes.successful) {
                      // Check ticket status
                      this.checkTicketStatus(res, ticketId);
                    }
                    return verifyRes;
                  })
                );
            }
            throw new Error('Document upload failed');
          })
        )
        .subscribe();
    } else {
      // Check if high profile account
      if (
        taskData.IsHighProfileAccount &&
        this.sessionService.subsidiary.bankId === '43'
      ) {
        // Check if documents exist
        if (
          !this.data.documents ||
          !this.data.documents.some(
            (doc: { document: { data: any } }) => doc.document?.data
          )
        ) {
          this.dialogRef.close();

          this.toastService.show(
            'Warning',
            'Please upload required documents for high profile account activation',
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            false
          );

          return;
        }
      } else {
        //verify dormant activation
        this.accountService['verifyDormantAcc'](this.data.ticketId || ticketId, bioModels)
          .subscribe((res: any) => {
            if (res.successful) {
              this.dialogRef.close();
              // Check ticket status
              this.checkTicketStatus(res, this.data.ticketId || ticketId);
            }
          });
      }
    }
  }

  private checkTicketStatus(verifyRes: any, ticketId: string) {
    if (verifyRes.successful) {
      if (verifyRes?.statusMessage?.includes('Request successful')) {
        this.router.navigate(['/services/customer-360/success'], {
          queryParams: { status: 'Completed', ticketId: ticketId },
        });
      } else if (verifyRes?.statusMessage?.includes('Submitted to checker')) {
        this.router.navigate(['/services/customer-360/success'], {
          queryParams: { status: 'Pending', ticketId: ticketId },
        });
      }
    } else {
      this.toast.show(
        'Bio not verified',
        '',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
    }
    return;
  }

  onChangeofSignatureBioVerify() {
    const ticketId = this.data.ticketId as string;
    let bioModels: any = [
      {
        cif: this.data.user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      },
    ];

    //TODO: Add a different logic for DRC
    if (this.sessionService.subsidiary.countryCode !== 'CD') {
      this.changeOfSignatureService['bioVerify'](ticketId, bioModels).subscribe(
        (response: any) => {
          if (!response.successful) return;
          if (response.successful)
            return this.dialogRef.close({ data: this.data.accepted });
        },
        (error: any) => {
          this.dialogRef.close({ data: error });
        }
      );
    } else {
      const ticketId = JSON.parse(
        <string>localStorage.getItem('runningTaskId')
      );
      const customer: any = JSON.parse(
        <string>localStorage.getItem('accMgntObj')
      );
      const actionFlow = localStorage.getItem('runningActionFlow');
      this.changeMandateService['bioVerifyV2'](ticketId, actionFlow, bioModels)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            if (!response.successful) return;
            if (response.successful)
              return this.dialogRef.close({
                data: this.data.accepted,
              });
          },
          (error: any) => {
            this.dialogRef.close();
          }
        );
    }
  }

  onVerifyGenerateStatement() {
    const ticketId = this.data.ticketId as string;
    let bioModels: Bio = {
      bioModels: [
        {
          cif: this.data.user.cif,
          skipBio: false,
          fingerprints: [this.rightIndexObj],
        },
      ],
    };

    this.accountStatementService['verifyBio'](bioModels, ticketId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (!response.successful) {
            this.toast.show(
              'Generate Statement',
              response.statusMessage,
              MessageBoxType.DANGER,
              50000,
              undefined,
              undefined,
              false
            );
            return;
          }
          if (response.successful) {
            return this.dialogRef.close({
              data: this.data.accepted,
              base64: response.responseObject,
            });
          }
        },
        error: (error: any) => {
          this.dialogRef.close();
        },
      });
  }

  onVerifyStandingOrder() {
    const bioModels: any = {
      cif: this.data.user.cif,
      fingerPrints: [this.rightIndexObj],
    };

    this.standingOrderService['verifyStandingOrderBio'](this.data.ticketId, bioModels)
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: any) => {
        if (!result.successful) {
          this.toast.show(
            'Error',
            result.statusMessage,
            MessageBoxType.DANGER,
            50000,
            undefined,
            undefined,
            false
          );
          return;
        }
        this.dialogRef.close({
          data: this.data.accepted,
          result: result,
        });
      });
  }

  onVerifyNotificationPreferenceSettings(): void {
    const bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };

    const customerDataObj: any = {
      ...this.data.customerInformation,
      bioModel: bioModels,
    };

    this.notificationPreferenceSrv['postAccNtnPreferences'](customerDataObj)
      .subscribe({
        next: (resp: any) => {
          this.toast.show(
            '',
            resp.statusMessage,
            resp.successful ? MessageBoxType.SUCCESS : MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false,
            false
          );

          if (!resp.successful) return;

          this.dialogRef.close({
            data: this.data.accepted,
            response: resp,
          });
        },
        error: () => {
          //Handled globally
        },
      });
  }

  // continue() {
  //     if (this.data.changeOfMandate) {
  //         this.onClickVerify()
  //         return
  //     }
  //     this.router.navigateByUrl('services/customer-360');
  //     this.dialogRef.close({ data: this.data.accepted });
  // }

  get showNotActive() {
    return this.editorBtn === 'deactivate';
  }
  get showActive() {
    return this.editorBtn === 'activate';
  }

  ngOnDestroy(): void {
    this.loaderService.suppressLoader = false;
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
