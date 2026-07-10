import { Component, Inject, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../shared-stubs/compat-barrel';

@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-charges-dialog',
  template: `
    <div mat-dialog-content class="container flex flex-col items-start">
      <div class="flex flex-row w-full items-center justify-between">
        <div class="charges-heading">{{ 'COMMON.CHARGES' | translate }}</div>
        <mat-icon
          aria-hidden="false"
          aria-label="close icon"
          class="close-icon"
          (click)="closeDialog()"
          >close</mat-icon
        >
      </div>
      <div class="flex flex-col w-full h-full items-start">
        <div class="charges">
          <div class="charge-breakdown">
            @for (charge of data.charges; track charge) {
              <div class="charge-line">
                <span class="charge-label">{{
                  charge.type === 'VatAmount'
                    ? ('FIELDS.VAT' | translate)
                    : charge.type === 'RscAmount'
                      ? ('FIELDS.RSC' | translate)
                      : charge.type
                }}</span>
                <span class="charge-value">{{ charge.amount | number: '1.2-2' }}</span>
              </div>
            }
            <div class="charge-line">
              <span class="charge-label">{{ 'FIELDS.NORMAL_CHARGE' | translate }}</span>
              <span class="charge-value">{{ data.additionalChargeAmount | number: '1.2-2' }}</span>
            </div>
            <mat-divider class="charge-divider"></mat-divider>
            <div class="charge-line">
              <span class="charge-label">{{ 'FIELDS.SUM_OF_CHARGES' | translate }}</span>
              <span class="charge-value">{{ data.sumOfCharges | number: '1.2-2' }}</span>
            </div>
            <div class="charge-line charge-total">
              <span class="charge-label">{{ 'FIELDS.CHARGE_AMOUNT' | translate }}</span>
              <span class="charge-value">{{ data.totalChargeAmount | number: '1.2-2' }}</span>
            </div>
            <div class="charge-line">
              <span class="charge-label">{{ 'FIELDS.CHARGE_AMOUNT_CURRENCY' | translate }}</span>
              <span class="charge-value">{{ data.totalChargeCurrency || chargeCurrency }}</span>
            </div>
          </div>
          @if (data.countryCode !== 'CD') {
            <div class="charges-sub">
              {{ 'COMMON.CHARGE_OPTION_DEFAULTS_TO_SHA' | translate }}
            </div>
          }
          @if (data.countryCode === 'CD') {
            <div class="charges-sub">
              {{ 'COMMON.CHARGE_OPTION_DEFAULTS_TO_OUR' | translate }}
            </div>
          }
        </div>
      </div>
      <div class="flex flex-row w-full h-full items-center justify-end gap-5">
        <button mat-flat-button mat-dialog-close (click)="closeDialog()">
          {{ 'COMMON.CANCEL' | translate }}
        </button>
        <button mat-flat-button color="primary" (click)="acceptDialog()">
          {{ 'COMMON.CONFIRM' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .close-icon {
        cursor: pointer;
      }
      .charges-heading {
        font-size: 1.3rem;
      }
      .charges {
        margin: 20px 0;
        .charge-breakdown {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .charge-line {
          display: flex;
          justify-content: space-between;
          font-size: 1.1rem;
          .charge-label {
            color: rgba(0, 0, 0, 0.6);
          }
          .charge-value {
            font-weight: 500;
          }
        }
        .charge-total {
          font-weight: 600;
          font-size: 1.2rem;
          .charge-label,
          .charge-value {
            color: rgba(0, 0, 0, 0.87);
            font-weight: 600;
          }
        }
        .charge-divider {
          margin: 4px 0;
        }
        .charges-sub {
          font-size: 1.1rem;
          font-style: italic;
          padding-top: 10px;
        }
      }
    `,
  ],
})
export class ChargesDialog implements OnInit, OnDestroy {
  private destroySubject = new Subject();

  protected chargeCurrency: string;

  constructor(
    public dialogRef: MatDialogRef<ChargesDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.chargeCurrency = data.totalChargeCurrency || data.additionalChargeCurrency || '';
  }

  ngOnInit(): void {}

  closeDialog() {
    const fallback = this.data.countryCode === 'CD' ? 'OUR' : 'SHA';
    this.dialogRef.close(fallback);
  }

  acceptDialog() {
    this.dialogRef.close('OUR');
  }

  ngOnDestroy(): void {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }
}
