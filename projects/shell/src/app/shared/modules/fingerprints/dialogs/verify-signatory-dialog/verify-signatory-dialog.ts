import { Component, Inject, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageBoxType, ToastService } from '../../../toast';
import { ApiService, SessionService } from '../../../../services';
import { AccountSignatory, BioVerifyInput } from '../../models';
import { VerifySkipBioDialog } from '../../dialogs';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';

enum CHOICES {
  INDETERMINATE,
  YES,
  NO,
}

@Component({
  selector: 'app-verify-signatory-dialog',
  templateUrl: './verify-signatory-dialog.html',
  styleUrls: ['./verify-signatory-dialog.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class VerifySignatoryDialog implements OnInit, OnDestroy {
  accountSignatories: AccountSignatory[] = [];
  CHOICES = CHOICES;
  choice: CHOICES = CHOICES.INDETERMINATE;
  mandate!: string;
  allComplete = false;
  destroy$ = new Subject();

  constructor(
    public dialog: MatDialog,
    private toast: ToastService,
    private api: ApiService,
    private session: SessionService,
    public dialogRef: MatDialogRef<VerifySignatoryDialog>,
    @Inject(MAT_DIALOG_DATA) public data: BioVerifyInput
  ) {}

  ngOnInit(): void {
    this.getSignatories();
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  setChoice(event: any): void {
    this.choice = event.value;
  }

  getSignatories = () => {
    this.api
      .post<any>(`/v1/account/mandate-signatory-inquiry`, {
        AccountId: this.data?.account?.accountNumber,
        BankId: this.session.currentUser.bankId,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        if (!res.successful) {
          this.toast.show(
            null,
            res.statusMessage,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            true
          );
        }
        // Personal accounts will have 1 mandate
        if (res.responseObject.mandates.length === 1) {
          let x = res.responseObject.mandates[0];
          this.mandate = x.operationMode;
          this.accountSignatories = [
            {
              name: x.signatoryName,
              cif: x.cif,
              deleted: x.isDeleted,
              signatoryType: x.signatoryType,
              checked: false,
              captured: false, // For verification
              active: false, // For verification
            },
          ];
        } else {
          // Just in case account mandate has changed
          this.mandate = res.responseObject.mandates.find(
            (m: any) => !m.isDeleted && m.signatoryType !== 'M'
          )?.operationMode;
          this.accountSignatories = res.responseObject.mandates
            .filter(
              // De-activated and M (Main) should not be included for coop & group
              (m: any) => !m.isDeleted && m.signatoryType !== 'M'
            )
            .map((x: any) => {
              return {
                name: x.signatoryName,
                cif: x.cif,
                deleted: x.isDeleted,
                signatoryType: x.signatoryType,
                checked: false,
                captured: false, // For verification
                active: false, // For verification
              };
            });
        }
      });
  };

  get accountMandate(): any {
    return this.mandate || this.data.account?.mandate;
  }

  continue() {
    const accountMandate = this.accountMandate;
    if (this.choice === CHOICES.INDETERMINATE) return;

    const checkedSignatories = this.accountSignatories.filter(
      t => t.checked == true
    );
    if (this.choice === CHOICES.YES) {
      if (
        accountMandate === 'ALL' &&
        checkedSignatories.length < this.accountSignatories.length
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
          accountMandate,
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
        this.accountSignatories.length > 2
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
      this.dialogRef.close({
        success: true,
        skipBio: false,
        skipBioForm: null,
        documents: [],
        signatories: checkedSignatories,
        status: this.choice,
      });
    } else {
      this.skipBio();
    }
  }

  updateAllComplete() {
    this.allComplete = this.accountSignatories.every(t => t.checked);
  }

  someComplete(): boolean {
    return this.accountSignatories.some(s => s.checked) && !this.allComplete;
  }

  selectAll(completed: boolean) {
    this.allComplete = completed;
    this.accountSignatories.forEach(t => (t.checked = completed));
  }

  getAvatarName(name: string): string {
    return name
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
  }

  skipBio() {
    if (this.data.inProcess) {
      this.dialogRef.close({
        fingerprints: [],
        success: true,
        skipBio: true,
        skipBioForm: null,
        documents: [],
      });
      return;
    }
    const dialogRef = this.dialog.open(VerifySkipBioDialog, {
      width: '50%',
      data: this.data,
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        if (result) {
          if (result !== 'back') {
            this.dialogRef.close({
              fingerprints: [],
              success: result.success,
              skipBio: result.skipBio,
              skipBioForm: result.skipBioForm,
              documents: result.documents,
            });
          }
        }
      });
  }
}
