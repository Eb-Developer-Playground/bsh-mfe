import { Component, Inject, inject, OnDestroy, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Subject } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { TranslatePipe } from '../../../shared-stubs/translate.pipe';

@Component({
  selector: 'app-update-address-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    TranslatePipe,
  ],
  template: `
    <div mat-dialog-content class="container flex flex-col items-start">
      <div class="flex flex-row w-full items-center justify-between">
        <div class="update-address-heading">
          Update remittance address
          <p>
            Update the address before continuing. Address line 1 should be a minimum of 10
            characters.
          </p>
        </div>
        <mat-icon
          aria-hidden="false"
          aria-label="close icon"
          class="close-icon"
          (click)="closeDialog()"
          >close</mat-icon
        >
      </div>

      <div class="update-address-details">
        <form
          [formGroup]="updateAddressForm"
          class="flex flex-col w-full items-center justify-between gap-5"
        >
          <mat-form-field appearance="fill" class="w-100 mt-1m">
            <mat-label>{{
              'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.COUNTRY.LABEL' | translate
            }}</mat-label>
            <mat-select formControlName="CountryCode">
              <mat-option value="" disabled>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.COUNTRY.TEXT' | translate
              }}</mat-option>
              <mat-option [value]="'CD'">Democratic Republic of Congo</mat-option>
            </mat-select>
            @if (updateAddressForm.controls['CountryCode'].hasError('required')) {
              <mat-error>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REQUIRED-ERROR' | translate
              }}</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="fill" class="w-100 mt-1m">
            <mat-label>{{
              'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REMITTER_ADDRESS_1.LABEL' | translate
            }}</mat-label>
            <input
              matInput
              placeholder="{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REMITTER_ADDRESS_1.TEXT' | translate
              }}"
              formControlName="RemitterAddressLine1"
            />
            @if (updateAddressForm.controls['RemitterAddressLine1'].hasError('required')) {
              <mat-error>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REQUIRED-ERROR' | translate
              }}</mat-error>
            }
            @if (updateAddressForm.controls['RemitterAddressLine1'].hasError('minlength')) {
              <mat-error>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.MINIMUM-ERROR' | translate
              }}</mat-error>
            }
          </mat-form-field>

          <div class="flex flex-row w-full items-center justify-between gap-5 w-100">
            <mat-form-field appearance="fill" class="w-100 mt-1m">
              <mat-label>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REGION.LABEL' | translate
              }}</mat-label>
              <mat-select formControlName="Region">
                <mat-option value="" disabled>{{
                  'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REGION.TEXT' | translate
                }}</mat-option>
                @for (option of data.regions; track option) {
                  <mat-option [value]="option.value" class="h-auto">
                    <span
                      ><span class="fw-600">{{ option.value }} - {{ option.text }}</span></span
                    >
                  </mat-option>
                }
              </mat-select>
              @if (updateAddressForm.controls['Region'].hasError('required')) {
                <mat-error>{{
                  'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REQUIRED-ERROR' | translate
                }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="fill" class="w-100 mt-1m">
              <mat-label>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.STATE.LABEL' | translate
              }}</mat-label>
              <mat-select formControlName="State">
                <mat-option value="" disabled>{{
                  'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.STATE.TEXT' | translate
                }}</mat-option>
                @for (option of data.states; track option) {
                  <mat-option [value]="option.code" class="h-auto">
                    <span
                      ><span class="fw-600">{{ option.code }} - {{ option.name }}</span></span
                    >
                  </mat-option>
                }
              </mat-select>
              @if (updateAddressForm.controls['State'].hasError('required')) {
                <mat-error>{{
                  'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REQUIRED-ERROR' | translate
                }}</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="fill" class="w-100 mt-1m">
              <mat-label>{{
                'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.TOWN_CITY.LABEL' | translate
              }}</mat-label>
              <mat-select formControlName="TownCity">
                <mat-option value="" disabled>{{
                  'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.TOWN_CITY.TEXT' | translate
                }}</mat-option>
                @for (option of data.townCities; track option) {
                  <mat-option [value]="option.code" class="h-auto">
                    <span
                      ><span class="fw-600">{{ option.code }} - {{ option.name }}</span></span
                    >
                  </mat-option>
                }
              </mat-select>
              @if (updateAddressForm.controls['TownCity'].hasError('required')) {
                <mat-error>{{
                  'SELECTION-DIALOG.UPDATE_REMITTER_ADDRESS.REQUIRED-ERROR' | translate
                }}</mat-error>
              }
            </mat-form-field>
          </div>
        </form>
      </div>

      <div class="flex flex-row w-full h-full items-center justify-end gap-5">
        <button mat-flat-button mat-dialog-close (click)="closeDialog()">
          {{ 'COMMON.CANCEL' | translate }}
        </button>
        <button
          mat-flat-button
          color="primary"
          [disabled]="updateAddressForm.invalid"
          (click)="acceptDialog()"
        >
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
      .update-address-heading {
        font-size: 1.3rem;
        p {
          font-size: 1rem;
          color: #929497;
        }
      }
      .update-address-details {
        margin: 20px 0;
      }
    `,
  ],
})
export class UpdateAddressDialog implements OnInit, OnDestroy {
  private _fb = inject(UntypedFormBuilder);
  updateAddressForm: UntypedFormGroup = this._fb.group({
    CountryCode: ['CD', [Validators.required]],
    RemitterAddressLine1: ['', [Validators.required, Validators.minLength(10)]],
    Region: ['', [Validators.required]],
    State: ['', [Validators.required]],
    TownCity: ['', [Validators.required]],
  });
  private destroySubject = new Subject();

  constructor(
    public dialogRef: MatDialogRef<UpdateAddressDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  ngOnInit(): void {}

  closeDialog() {
    this.dialogRef.close();
  }

  acceptDialog() {
    this.dialogRef.close({
      data: {
        ...this.updateAddressForm.getRawValue(),
        StateName: this.data.states.find(
          (state: any) => state.code === this.updateAddressForm.value.State,
        ).name,
        TownCityName: this.data.townCities.find(
          (townCity: any) => townCity.code === this.updateAddressForm.value.TownCity,
        ).name,
      },
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }
}
