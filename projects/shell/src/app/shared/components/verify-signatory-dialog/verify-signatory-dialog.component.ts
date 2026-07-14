import { Component, Inject, OnDestroy, OnInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { jwtDecode } from 'jwt-decode';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '@app/core/services';
import { MessageBoxType, ToastService } from '../../modules/toast';
import { SessionService } from '@app/shared/services/session/session.service';
import { VerifySkipBioComponent } from '../verify-skip-bio/verify-skip-bio.component';
import { SearchComponent } from '@app/home/search/search.component';

export interface signatoriesbioData {
  canVerify: string;
  user: {
    firstName: string;
    lastName: string;
    activeAccountNumber?: string;
    accounts: {
      accountNumber: string;
      mandate: string;
      accountName: string;
      schemeType: string;
    }[];
  };
  accountsSelected: {
    accountNumber: string;
    mandate: string;
    accountName: string;
    schemeType: string;
  };
  firstName: string;
  lastName: string;
  flow: string;
  searchFlow: boolean;
  inProcess: boolean;
  approvalType?: string;
}

@Component({
  selector: 'app-verify-signatory-dialog',
  templateUrl: './verify-signatory-dialog.component.html',
  styleUrls: ['./verify-signatory-dialog.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class VerifySignatoryDialogComponent implements OnInit, OnDestroy {
  @ViewChild(SearchComponent) CustomerSearchComponent!: SearchComponent;

  signatories = {
    name: 'Select all',
    completed: false,
    subtasks: [],
  };
  mandate!: string;
  allComplete = false;

  current: any[] = [];
  available: any[] = [];
  signatoriesArray: any[] = [];
  isBusiness: any = JSON.parse(<string>localStorage.getItem('isBusiness'));
  checkedSignatory: any;
  private destroy$ = new Subject();
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<VerifySignatoryDialogComponent>,
    private toast: ToastService,
    private accountService: AccountService,
    private toastService: ToastService,
    private sessionService: SessionService,
    @Inject(MAT_DIALOG_DATA) public data: signatoriesbioData
  ) {}

  ngOnInit(): void {
    //name, account number, account type, account mandate
    this.getSignatories();
  }

  setCanVerify(event: any): void {
    this.data.canVerify = event.value;
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

  isFeatureAccessibleForContactCenter() {
    return this.sessionService.hasRole('AccountManagement.EfrontUser');
  }
  getSignatories = () => {
    let sigData: any = {
      AccountId:
        this.data?.accountsSelected?.accountNumber ||
        this.data.user.accounts[0]?.accountNumber,
      BankId: this.getCurrentUserBankId(),
    };
    this.accountService['getAccountSignatories'](sigData, { headers: { skipLoadingInterceptor: 'true' } })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res.successful) {
          this.toastService.show(
            'Signatories',
            res.statusMessage,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
        // Personal accounts will have 1 mandate
        if (res.responseObject.mandates.length === 1) {
          let x = res.responseObject.mandates[0];
          this.mandate = x.operationMode;
          this.signatoriesArray = [
            {
              name: x.signatoryName,
              cif: x.cif,
              deleted: x.isDeleted,
              signatoryType: x.signatoryType,
              current: false,
            },
          ];
        } else {
          // Just in case account mandate has changed
          // Differentiate between joint and Entity Accounts
          if (this.isBusiness) {
            this.mandate = res.responseObject.mandates.find(
              (m: any) => !m.isDeleted && m.signatoryType !== 'M'
            )?.operationMode;

            this.signatoriesArray = res.responseObject.mandates
              .filter(
                // De-activated and M (Main) should not be included for coop & group
                (m: any) => !m.isDeleted && m.signatoryType !== 'M'
              )
              .map((x: any) => {
                const obj = {
                  name: x.signatoryName,
                  cif: x.cif,
                  deleted: x.isDeleted,
                  signatoryType: x.signatoryType,
                  current: false,
                };
                return obj;
              });
          } else {
            this.mandate = res.responseObject.mandates.find(
              (m: any) => !m.isDeleted
            )?.operationMode;

            this.signatoriesArray = res.responseObject.mandates
              .filter((m: any) => !m.isDeleted)
              .map((x: any) => {
                const obj = {
                  name: x.signatoryName,
                  cif: x.cif,
                  deleted: x.isDeleted,
                  signatoryType: x.signatoryType,
                  current: false,
                };
                return obj;
              });
          }
        }
      });
  };

  get accountMandate(): any {
    // When mandate has changed, accounts are not updated instantly. So prioritize mandate from mandate inquiry
    return this.mandate || this.data.user.accounts[0]?.mandate;
  }

  getCurrentUserBankId() {
    const parsedToken: any = jwtDecode(
      this.sessionService.loginResponse.access_token
    );
    return parsedToken.bankId;
  }

  continue() {
    const accountMandate = this.accountMandate;
    if (this.data.canVerify === '') return;

    const checkedSignatories = this.signatoriesArray.filter(
      t => t.current == true
    );
    if (this.data.canVerify !== 'canNotVerify') {
      if (
        accountMandate === 'ALL' &&
        checkedSignatories.length < this.signatoriesArray.length
      ) {
        this.toast.show(
          null,
          'TOAST.SELECT-ALL-SIGNATORIES',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      } else if (accountMandate === 'ETS' && checkedSignatories.length === 0) {
        this.toast.show(
          null,
          'TOAST.SELECT-ONE-SIGNATORY',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      } else if (
        (accountMandate === 'ANY' ||
          accountMandate === 'AWITH' ||
          accountMandate === 'BTS') &&
        checkedSignatories.length < 2
      ) {
        this.toast.show(
          null,
          'TOAST.SELECT-ANY-TWO-SIGNATORIES',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      } else if (
        accountMandate === 'TTS' &&
        checkedSignatories.length < 3 &&
        this.signatoriesArray.length > 2
      ) {
        this.toast.show(
          null,
          'TOAST.SELECT-ANY-THREE-SIGNATORIES',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      } else if (checkedSignatories.length === 0) {
        this.toast.show(
          null,
          'TOAST.SELECT-A-SIGNATORY',
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      }
    } else if (!this.data.searchFlow) {
      this.dialogRef.close({
        data: checkedSignatories,
        status: this.data.canVerify,
      });
    } else {
      this.SkipBio();
    }

    this.dialogRef.close({
      data: checkedSignatories,
      status: this.data.canVerify,
    });
  }

  updateAllComplete() {
    this.allComplete =
      this.signatoriesArray != null &&
      this.signatoriesArray.every(t => t.current);
  }

  someComplete(): boolean {
    if (this.signatories.subtasks == null) {
      return false;
    }
    return (
      this.signatoriesArray.filter(t => t.current).length > 0 &&
      !this.allComplete
    );
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.signatories.subtasks == null) {
      return;
    }
    this.signatoriesArray.forEach(t => (t.current = completed));
  }

  public getAvatarName(name: string): string {
    const avatarArray = name
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
    return avatarArray;
  }

  SkipBio() {
    const dialogRef = this.dialog.open(VerifySkipBioComponent, {
      data: {
        approvalType: this.data?.approvalType ? this.data?.approvalType : null,
        searchFlow: this.data?.searchFlow,
        user: this.data.user,
        headerText: 'Skip Biometric',
        subHeaderText: 'Requirements for bio-override',
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (!result) {
          this.dialog.open(VerifySignatoryDialogComponent, {
            width: '50%',
            height: 'auto',
            data: {
              user: this.data.user,
            },
          });
        }
      });
  }

  hideBio(): boolean {
    return this.sessionService.hasFeatureRole(
      'AccountManagement.ViewWithReason'
    );
  }
  closeDialog() {
    (this.CustomerSearchComponent as any)?.clearSearchText();
    this.dialogRef.close({ bioDialogClosed: true });
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
