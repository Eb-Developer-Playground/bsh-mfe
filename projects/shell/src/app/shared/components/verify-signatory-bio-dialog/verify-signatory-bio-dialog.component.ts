import { SchedulePaymentService } from '@app/core/services/schedule-payment/schedule-payment.service';
import { Component,
  ElementRef,
  EventEmitter,
  Inject,
  OnDestroy,
  OnInit,
  Output,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { IsActiveMatchOptions, Router } from '@angular/router';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { Subject } from 'rxjs';
import { map, switchMap, takeUntil } from 'rxjs/operators';
import { AccountStatementService } from '@app/core/services/account-statement/account-statement.service';
import { AccountService } from '@app/core/services/account/account.service';
import { BiometricService } from '@app/core/services/biometric/biometric.service';
import { ChangeMandateService } from '@app/core/services/change-mandate/change-mandate.service';
import { ChangeOfSignatureService } from '@app/core/services/change-of-signature/change-of-signature.service';
import { ChequeRequestService } from '@app/core/services/cheque-book-request/cheque-request.service';
import { CustomerProfileService } from '@app/core/services/customer-profile/customer-profile.service';
import { CustomerService } from '@app/core/services/customer/customer.service';
import { MoveMoneyService } from '@app/core/services/move-money/move-money.service';
import { StandingOrderService } from '@app/core/services/standing-order/standing-order.service';
import { Bio } from '@app/home/customer/account-statements/models/account-statement';
import { environment as envProd } from '@env/environment.prod';
import { environment as envUAT } from '@env/environment.uat';
import { MessageBoxType, ToastService } from '../../modules/toast';
import { SessionService } from '@app/shared/services/session/session.service';
import { BIO_EXEMPTED_USERS } from '../../static';
import { isDev, isUat } from '../../utils';
import { BioEnrollmentComponent } from '../bio-enrollment/bio-enrollment.component';
import { VerifySignatoryDialogComponent } from '../verify-signatory-dialog/verify-signatory-dialog.component';
import { ActionTicketsService } from '@app/shared/services/actionTickets/action-tickets.service';
import { ChannelsService } from '@app/core/services/channels/channels.service';
import { SuccessDialogComponent } from '@app/home/customer/cards/success-dialog/success-dialog.component';
import { IUploadedDocument } from '@app/shared/modules/upload-docs';
import { TicketService } from '@app/core/services/ticket/tickets.service';
import { TransactionLimitsService } from '@app/core/services/transaction-limits/transaction-limits.service';
import { ContextManager } from '@app/shared/modules/stepper';
import { AccountSelectionService } from '@app/core/services/account-selection/account-selection.service';
import { VerifySkipBioComponent } from '../verify-skip-bio/verify-skip-bio.component';
import { NotificationPreferencesService } from '@app/core/services/notification-preferences.service';
import { LoaderService } from '@app/shared/modules/loader';

export interface VerifySignatoryBioData {
  isForiegnDraft: any;
  isBankerRequest?: any;
  accepted: boolean;
  firstName: string;
  lastName: string;
  hideSkipBio: boolean;
  callBack: boolean;
  skipFunction: any;
  user: any;
  inProcess: boolean;
  signatories: any[];
  ticketId: string;
  customerInformation: any;
  cif: string;
  activateDormantAccount: boolean;
  documents?: any;
  AccountNumber?: string;
}

@Component({
  selector: 'app-verify-signatory-bio-dialog',
  templateUrl: './verify-signatory-bio-dialog.component.html',
  styleUrls: ['./verify-signatory-bio-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class VerifySignatoryBioDialogComponent implements OnInit, OnDestroy {
  firstName = '';
  lastName = '  ';
  payload: any;

  code: any;
  state: any;

  makeActive = false;
  rightIndexObj: any;
  rt_index: any;
  editor: any;
  editorBtn: any = '';
  @ViewChild('RIGHT_INDEX_1', { read: ElementRef })
  right_index_finger!: ElementRef;
  cif: any;
  CIF: any;
  secugenLicenseStr: any;
  defaultImage = 'assets/images/fingerprint-icon.png';
  @Output() verifyBioData: EventEmitter<any> = new EventEmitter<any>();
  verified = false;
  Signatories: any;
  allCaptured!: boolean;
  multipleBioObj: any = [];
  private destroy$ = new Subject();
  accountsSelected: any = '';
  isSubmitting = false;

  get accountMandate(): any {
    // When mandate has changed, accounts are not updated instantly. So prioritize mandate from mandate inquiry
    return (
      this.data.signatories.find(
        (m: any) => !m.isDeleted && m.signatoryType !== 'M'
      )?.operationMode || this.data.user.accounts[0]?.mandate
    );
  }

  useChangeMandateFlowV2 = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VerifySignatoryBioDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: VerifySignatoryBioData,
    private toast: ToastService,
    private router: Router,
    private bs: BiometricService,
    private accountService: AccountService,
    private changeMandateService: ChangeMandateService,
    private changeOfSignatureService: ChangeOfSignatureService,
    private moveMoneyService: MoveMoneyService,
    private customerService: CustomerService,
    private customerProfileService: CustomerProfileService,
    private chequeBookService: ChequeRequestService,
    private sessionService: SessionService,
    private accountStatementService: AccountStatementService,
    private standingOrderService: StandingOrderService,
    private channelsService: ChannelsService,
    private schedulePaymentService: SchedulePaymentService,
    private ticketService: TicketService,
    private transactionLimitService: TransactionLimitsService,
    private ctxManager: ContextManager,
    private accountSelectionService: AccountSelectionService,
    private actionTicketsService: ActionTicketsService,
    private notificationPreferenceSrv: NotificationPreferencesService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.useChangeMandateFlowV2 = this.changeMandateService['useChangeMandateFlowV2'](
      this.sessionService.subsidiary.countryCode
    );

    const selectedAcc = localStorage.getItem('selectedAccount');
    if (selectedAcc) {
      this.accountsSelected = JSON.parse(selectedAcc);
    }
    this.Signatories = this.data.signatories.map((user: any) => ({
      name: user.name,
      cif: user.cif,
      deleted: user.deleted,
      signatoryType: user.signatoryType,
      active: false,
      captured: false,
    }));

    // Subscribe to account selection changes to update account context during bio verification
    this.accountSelectionService['selectedAccount$']
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedAccount: any) => {
        if (
          selectedAccount &&
          selectedAccount.accountNumber !== this.accountsSelected?.accountNumber
        ) {
          // Update the account context for bio verification
          this.accountsSelected = selectedAccount;
        }
      });
  }

  selectedUser(user: any) {
    user.active = true;
    this.defaultImage = 'assets/images/fingerprint-icon.png';
    this.captureFingerPrint(user);
  }

  public getAvatarName(name: string): string {
    return name
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
  }

  enrollBio() {
    this.dialogRef.close({ data: 'bioEnrollment' });

    const dialogRef = this.dialog.open(BioEnrollmentComponent, {
      data: {
        user: this.data.user,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result) {
          const dialogRef = this.dialog.open(VerifySignatoryDialogComponent, {
            data: {
              user: this.data.user,
            },
          });
        }
      });
  }

  skipBio(): void {
    this.dialogRef.close();
    this.dialog.open(VerifySkipBioComponent, {
      data: {
        user: this.data.user,
        ticketId: this.data.ticketId,
      },
    });
  }

  captureFingerPrint(user: any) {
    let uriString: any;
    this.data.accepted = false;
    if (isDev()) {
      uriString = 'timeout=10000&quality=75&licstr=';
    } else if (isUat()) {
      this.secugenLicenseStr = (envUAT as any).secugenLicenseUAT;
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
      window.location.hostname === 'customer360-dev.equitybankgroup.com' ||
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
      this.activateBtn(this.rightIndexObj, user);
      this.data.accepted = true;
      user.captured = true;
      if (
        this.Signatories.filter((t: { captured: any }) => !t.captured)
          .length === 0
      ) {
        this.allCaptured = true;
      }
      let multipleFingersObj = {
        cif: user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      };
      this.multipleBioObj.push(multipleFingersObj);
    } else {
      this.bs
        ['postMultipleCapture'](uriString)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (v: any) => {
            if (v.ErrorCode === 0) {
              if (v.ImageQuality < 50) {
                this.toast.show(
                  '',
                  'Finger Print Quality is less than 50',
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
                this.activateBtn(this.rightIndexObj, user);
                this.data.accepted = true;
                user.captured = true;
                if (
                  this.Signatories.filter((t: { captured: any }) => !t.captured)
                    .length === 0
                ) {
                  this.allCaptured = true;
                }
                let multipleFingersObj = {
                  cif: user.cif,
                  skipBio: false,
                  fingerPrints: [this.rightIndexObj],
                };
                this.multipleBioObj.push(multipleFingersObj);
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
              user.captured = false;
              if (
                this.Signatories.filter((t: { captured: any }) => !t.captured)
                  .length !== 0
              ) {
                this.allCaptured = false;
              }
            } else if (v.ErrorCode !== 54 && v.ErrorCode !== 0) {
              this.data.accepted = false;
              user.captured = false;
              if (
                this.Signatories.filter((t: { captured: any }) => !t.captured)
                  .length !== 0
              ) {
                this.allCaptured = false;
              }
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
          },
          (error: any) => {
            this.data.accepted = false;
            user.captured = false;
            if (
              this.Signatories.filter((t: { captured: any }) => !t.captured)
                .length !== 0
            ) {
              this.allCaptured = false;
            }
          }
        );
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

  isObject = (obj: any) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  activateBtn(indexObj: any, signatory: any) {
    this.verifyBioData.emit(this.rightIndexObj);
    this.rightIndexObj = indexObj;
    // this.dialog.closeAll();
    const bioObj = {
      cif: signatory.cif,
      fingerprints: [indexObj],
      CheckerOauth: {},
    };
    if (
      window.location.hostname === 'customer360-dev.equitybankgroup.com' ||
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
      this.accountService['verifyAccount'](bioObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe((v: any) => {
          if (v.successful) {
            this.toast.show(
              'Bio Verification',
              v.statusMessage,
              MessageBoxType.SUCCESS,
              5000,
              undefined,
              undefined,
              false
            );
            localStorage.setItem('show-bio-captured', 'true');
            this.verified = true;
          } else {
            this.toast.show(
              'Bio Verification',
              'Verification Failed',
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

  continue() {
    this.isSubmitting = true;
    this.loaderService.suppressLoader = true;
    const matchOptions: IsActiveMatchOptions = {
      matrixParams: 'exact',
      queryParams: 'ignored',
      paths: 'exact',
      fragment: 'exact',
    };
    if (this.router.isActive('/services', matchOptions)) {
      this.dialogRef.close({
        data: this.data.accepted,
        fingerprint: this.rightIndexObj,
      });
      this.router.navigateByUrl('/services/customer-360').then(m => {});
    } else if (
      this.router.isActive('/services/change-of-mandate', matchOptions)
    ) {
      this.onClickVerify();
      return;
    } else if (
      this.router.isActive(
        'services/cheque-requests/preview-new-cheque-request',
        matchOptions
      ) ||
      this.router.isActive('services/cheque-requests', matchOptions) ||
      this.router.isActive('services/cheque-requests/stop-cheque', matchOptions)
    ) {
      this.onClickVerifyCheque();
      return;
    } else if (
      this.router.isActive('/services/change-of-signature', matchOptions)
    ) {
      this.onChangeofSignatureBioVerify();
      return;
    } else if (this.router.isActive('/services/funds-transfer', matchOptions)) {
      this.onVerifyMoveMoney();
      return;
    } else if (
      this.router.isActive('/services/customer-360/register', matchOptions)
    ) {
      this.onVerifyCustomerRegistration();
      return;
    } else if (
      this.router.isActive(
        '/services/customer-360/profile-manager',
        matchOptions
      )
    ) {
      this.onVerifyCustomerProfile();
      return;
    } else if (
      this.router.isActive('/services/cheque-requests/new', matchOptions)
    ) {
      this.onClickVerifyNewChequeRequest();
      return;
    } else if (
      this.router.isActive('services/known-agent/remove-agent', {
        matrixParams: 'ignored',
        queryParams: 'ignored',
        paths: 'subset',
        fragment: 'ignored',
      }) ||
      this.router.isActive('services/known-agent/add-agent', {
        matrixParams: 'ignored',
        queryParams: 'ignored',
        paths: 'subset',
        fragment: 'ignored',
      })
    ) {
      this.onKnowAgentBioVerify();
      return;
    } else if (
      this.router.isActive('/services/account-statements', matchOptions)
    ) {
      this.onVerifyGenerateStatement();
      return;
    } else if (this.data.activateDormantAccount) {
      this.onActivateDormantAccount(this.data.ticketId);
      return;
    } else if (
      this.router.isActive(
        '/services/omnichannel-profile/add-details',
        matchOptions
      )
    ) {
      this.onVerifySoftDeleteProfile();
      return;
    } else if (
      this.router.isActive(
        '/services/transaction-limits/limit-details',
        matchOptions
      )
    ) {
      this.onVerifyLimitAmendment();
      return;
    } else if (this.router.isActive('/services/standing-order', matchOptions)) {
      this.onVerifyStandingOrder();
      return;
    } else if (
      this.router.isActive(
        '/services/customer-360/channels/restrict-account',
        matchOptions
      )
    ) {
      this.onVerifyRestrictAccount();
      return;
    } else if (
      this.router.isActive(
        '/services/customer-360/channels/cancel-scheduled-payments',
        matchOptions
      )
    ) {
      this.onVerifyCancelSchedulePayment();
      return;
    } else if (
      this.router.isActive(
        'services/customer-360/channels/update-scheduled-payments',
        matchOptions
      )
    ) {
      this.onVerifyUpdateSchedulePayment();
      return;
    } else if (
      this.router.isActive(
        '/services/customer-360/crm/notification-preferences',
        matchOptions
      )
    ) {
      this.onVerifyNotificationPreferenceSettings();
      return;
    }

    this.dialogRef.close({
      data: this.data.accepted,
      fingerprint: this.rightIndexObj,
      success: true,
      skipBio: false,
    });
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
        this.toast.show(
          err,
          '',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
      }
    );
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
        this.toast.show(
          err,
          '',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
      }
    );
  }

  onVerifyCancelSchedulePayment() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });

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
          this.toast.show(
            err,
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      );
  }

  onVerifyUpdateSchedulePayment() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });

    this.schedulePaymentService['updateSchedulePayment'](customerDataObj)
      .subscribe(
        (res: any) => {
          if (!res.successful) return;
          this.toast.show(
            'Update Request sent for approval successfully!',
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
          this.toast.show(
            err,
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      );
  }

  onKnowAgentBioVerify() {
    this.dialogRef.close({
      data: true,
      rightFingerPrint: this.rightIndexObj,
    });
    // const bioObj = {
    //     cif: this.data.cif,
    //     fingerprints: [this.rightIndexObj]
    // };

    // this.accountService.verifyCustomerBio(this.data.ticketId, bioObj, true)
    //     .pipe(takeUntil(this.destroy$))
    //     .subscribe((result) => {

    //         if (!result.successful) {
    //             return;
    //         }
    //         this.toast.show(
    //             'Bio verified successfully',
    //             'Bio verified successfully',
    //             MessageBoxType.SUCCESS
    //         );

    // }, err => {
    //     this.dialogRef.close({ data: false });
    // }
    // )
  }

  onClickVerifyNewChequeRequest() {
    if (!this.data.isBankerRequest) {
      this.chequeBookService['bioVerifyNewChequeRequest'](
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
              });
            }
          },
          (error: any) => {
            this.dialogRef.close();
          }
        );
    } else if (this.data.isForiegnDraft) {
      this.chequeBookService['bioVerifyForeignDraftRequest'](
          this.data.cif,
          this.data.ticketId,
          this.rightIndexObj
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            if (!response.successful) {
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
            if (response.successful) {
              return this.dialogRef.close({
                data: this.data.accepted,
              });
            }
          },
          (error: any) => {
            this.dialogRef.close();
          }
        );
    } else {
      this.chequeBookService['bioVerifyBankerChequeRequest'](
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
              });
            }
          },
          (error: any) => {
            this.dialogRef.close();
          }
        );
    }
  }

  onClickVerify() {
    const actionFlow = localStorage.getItem('runningActionFlow');
    const ticketId = JSON.parse(<string>localStorage.getItem('runningTaskId'));

    if (!this.useChangeMandateFlowV2) {
      const customer: any = JSON.parse(
        <string>localStorage.getItem('accMgntObj')
      );
      this.changeMandateService['bioVerify'](customer.cif, ticketId, this.multipleBioObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (!response.successful) return;
            if (response.successful)
              return this.dialogRef.close({
                data: this.data.accepted,
              });
          },
          error: (error: any) => {
            this.dialogRef.close();
          },
        });
    } else {
      this.changeMandateService['bioVerifyV2'](ticketId, actionFlow, this.multipleBioObj) // This is the VerifyBio action
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response: any) => {
            if (response.successful) {
              if (
                ['RW', 'CD', 'UG', 'KE', 'SS'].includes(
                  this.sessionService.subsidiary.countryCode
                ) &&
                actionFlow
              ) {
                this.actionTicketsService
                  .validateMandateDocuments(ticketId, actionFlow)
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => {
                      this.dialogRef.close({ data: this.data.accepted });
                    },
                    error: () => {
                      this.dialogRef.close();
                    },
                  });
                return;
              }
              this.dialogRef.close({
                data: this.data.accepted,
              });
            }
          },
          error: () => {
            this.dialogRef.close();
          },
        });
    }
  }

  onClickVerifyCheque() {
    const ticketId = this.ctxManager.contextData?.['chequebook_request']?.ticket
      ? this.ctxManager.contextData['chequebook_request'].ticket.ticketId
      : JSON.parse(localStorage.getItem('ticket') || '{}').ticketId;

    const customer: any = JSON.parse(
      <string>localStorage.getItem('accMgntObj')
    );
    const actionFlow = this.ctxManager.contextData?.['chequebook_request']?.ticket
      ? this.ctxManager.contextData['chequebook_request'].ticket.actionFlowName
      : JSON.parse(localStorage.getItem('ticket') || '{}').actionFlowName;

    if (this.sessionService.subsidiary.countryCode !== 'CD') {
      this.changeMandateService['bioVerify'](customer.cif, ticketId, this.multipleBioObj)
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
    } else {
      this.changeMandateService['bioVerifyV2'](ticketId, actionFlow, this.multipleBioObj)
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

  //add v2 bio verify
  onChangeofSignatureBioVerify() {
    const ticketId = this.data.ticketId as string;
    if (this.sessionService.subsidiary.countryCode !== 'CD') {
      this.changeOfSignatureService
        ['bioVerify'](ticketId, this.multipleBioObj)
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (response: any) => {
            if (!response.successful) return;
            if (response.successful) {
              return this.dialogRef.close({
                data: this.data.accepted,
              });
            }
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
      this.changeMandateService
        ['bioVerifyV2'](ticketId, actionFlow, this.multipleBioObj)
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

  onVerifyMoveMoney() {
    this.dialogRef.close({ data: this.data.accepted });
    this.moveMoneyService['verifyCustomerBio'](this.data.ticketId, this.multipleBioObj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response: any) => {
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
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (!res.successful) {
            this.toast.show(
              'Customer Registration',
              res.statusMessage,
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
            return;
          }
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
          });
        },
        (err: any) => {
          this.toast.show(
            err,
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      );
  }

  onVerifyCustomerProfile() {
    // add bio data to customer data
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: false,
      fingerPrints: [this.rightIndexObj],
    };
    let customerDataObj = Object.assign(this.data.customerInformation, {
      bioModel: bioModels,
    });
    this.customerProfileService['updateCustomerProfile'](customerDataObj)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: any) => {
          if (!res.successful) {
            this.toast.show(
              'Customer Profile',
              res.statusMessage,
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              false
            );
            return;
          }
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
          });
        },
        (err: any) => {
          this.toast.show(
            err,
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      );
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

    this.accountStatementService['verifyBio'](bioModels, ticketId).subscribe(
      (response: any) => {
        if (!response.successful) {
          this.toast.show(
            'Generate Statement',
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
          this.dialogRef.close({
            data: this.data.accepted,
            base64: response.responseObject,
          });
        }
      },
      (err: string) => {
        this.toast.show(
          err,
          '',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
        this.dialogRef.close();
      }
    );
  }

  onActivateDormantAccount(ticketId: string) {
    const action = 'ActivateAccount';
    const bioModels: any = [
      {
        cif: this.data.user.cif,
        skipBio: false,
        fingerPrints: [this.rightIndexObj],
      },
    ];

    let taskData: any = {};

    if (localStorage.getItem('AccActivateTaskData')) {
      taskData = localStorage.getItem('AccActivateTaskData');

      taskData = JSON.parse(taskData);
    }

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
        AccountNumber: this.data.AccountNumber,
        Country: this.data.user?.preferredAddress?.country,
        ticketNumber: ticketId.toString(),
        idType: this.data.user?.preferredDocDesc,
        Service: taskData?.DocumentData?.Service || 'Blob',
        documents: validUploads,
        ProcessName: taskData?.DocumentData?.ProcessName,
        idNumber: this.data.user?.prefDocumentID,
      };
      // Upload documents if they exist
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

          this.toast.show(
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
        this.accountService['verifyDormantAcc'](ticketId, bioModels)
          .subscribe((res: any) => {
            if (res.successful) {
              this.dialogRef.close();
              // Check ticket status
              this.checkTicketStatus(res, ticketId);
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
        error: (err: any) => {
          this.toast.show(
            err,
            '',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
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
            5000,
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

  ngOnDestroy(): void {
    this.loaderService.suppressLoader = false;
    this.destroy$.next('');
    this.destroy$.complete();
  }

  closeDialog() {
    this.dialogRef.close({ bioDialogClosed: true });
  }

  get accountInfo() {
    if (this.accountsSelected && this.accountsSelected?.accountName) {
      const splitNames = this.accountsSelected?.accountName?.split(' ');
      let initials = '';
      if (splitNames.length) {
        initials = splitNames[0][0];
      }
      if (splitNames.length > 1) {
        initials += splitNames[1][0];
      }
      return {
        initials,
        name: this.accountsSelected.accountName,
        schemeType: this.accountsSelected.schemeType,
        mandate: this.accountsSelected.mandate,
        accountNumber: this.accountsSelected.accountNumber,
      };
    } else {
      return {
        initials:
          this.data.user.firstName[0] + this.data.user.lastName[0] || '',
        name: this.data.user.firstName + ' ' + this.data.user.lastName || '',
        schemeType: this.data.user.accounts[0].schemeType || '',
        mandate: this.accountMandate || '',
        accountNumber: this.data.user.accounts[0].accountNumber || '',
      };
    }
  }

  onVerifyNotificationPreferenceSettings(): void {
    let bioModels: any = {
      cif: this.data.user.cif,
      skipBio: true,
      fingerprints: [this.rightIndexObj],
    };

    let customerDataObj: any = {
      ...this.data.customerInformation,
      bioModel: bioModels,
    };

    this.notificationPreferenceSrv['postAccNtnPreferences'](customerDataObj)
      .subscribe({
        next: (res: any) => {
          this.toast.show(
            '',
            res.statusMessage,
            res.successful ? MessageBoxType.SUCCESS : MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false,
            false
          );

          if (!res.successful) return;

          this.dialogRef.close({
            data: this.data.accepted,
            response: res,
          });
        },
        error: () => {
          //Handled globally
        },
      });
  }
}
