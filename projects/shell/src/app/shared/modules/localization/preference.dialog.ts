import { Component, Inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ILocale } from './models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-language-pref',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="container" fxLayout="column" fxLayoutAlign="start">
      <div fxLayout="row" fxFlex="100" fxLayoutAlign="end center">
        <mat-icon
          aria-hidden="false"
          aria-label="close icon"
          class="close-icon"
          mat-dialog-close
          >close</mat-icon
        >
      </div>
      <div
        matDialogContent
        fxLayout="row"
        fxFill
        fxFlex="100"
        fxLayoutAlign="start center">
        <form [formGroup]="form" class="full-width">
          <h4 class="fw-500">
            {{ 'LOCALE.PREFERENCE.SELECT-DEFAULT-LANGUAGE' | translate }}
          </h4>
          <mat-form-field appearance="fill" class="w-100">
            <mat-label>{{
              'LOCALE.PREFERENCE.SELECT-DEFAULT-LANGUAGE' | translate</mat-label>
            <mat-select formControlName="language">
              <mat-option
                *ngFor="let language of languages"
                [value]="language.id">
                {{ language.name | translate }} ({{ language.id }})
              </mat-option>
            </mat-select>
          </mat-form-field>
        </form>
      </div>
      <div
        matDialogActions
        fxLayout="row"
        fxFill
        fxFlex="100"
        fxLayoutAlign="end center">
        <button mat-flat-button mat-dialog-close>
          {{ 'COMMON.CANCEL' | translate }}
        </button>
        <button
          [disabled]="!form.valid"
          mat-flat-button
          color="primary"
          (click)="closeDialog()">
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
    `,
  ],
})
export class PreferenceDialog implements OnInit {
  form!: UntypedFormGroup;
  label = 'Reason*';
  languages: ILocale[] = [
    { id: 'en-GB', name: 'LOCALE.LANGUAGES.ENGLISH' },
    { id: 'sw', name: 'LOCALE.LANGUAGES.SWAHILI' },
    { id: 'fr-CD', name: 'LOCALE.LANGUAGES.FRENCH' },
  ];

  constructor(
    private fb: UntypedFormBuilder,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<PreferenceDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      language: ['', [Validators.required]],
    });
  }

  closeDialog() {
    this.dialogRef.close({ language: this.form.controls['language'].value });
  }
}
