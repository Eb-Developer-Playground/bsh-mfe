import { NgClass, NgIf } from '@angular/common';
import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-new-collapsible',
  standalone: true,
  imports: [
    NgIf,
    NgClass,
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    TranslatePipe,
  ],
  template: `
    <mat-expansion-panel
      [expanded]="isActive"
      [disabled]="!isActive"
      [hideToggle]="hideToggle">
      <mat-expansion-panel-header
        [expandedHeight]="expandedHeight"
        [collapsedHeight]="collapsedHeight">
        <mat-panel-title>
          <div class="d-flex align-content-center">
            <ng-container *ngIf="counter">
              <span
                *ngIf="!isActive"
                class="counter color-white bg-grey align-self-center">
                {{ counter }}
              </span>
              <span
                *ngIf="!isValid && isActive"
                class="counter color-white bg-primary align-self-center">
                {{ counter }}
              </span>
              <span
                *ngIf="isValid && isActive"
                class="counter align-self-center">
                <mat-icon
                  style="width: 24px; height: 24px;"
                  svgIcon="ic-section-done"></mat-icon>
              </span>
            </ng-container>
            <div *ngIf="subText">
              <h3
                *ngIf="!subText"
                class="fw-400 align-self-center mt-0 mb-0 custom-title">
                {{ countTitle ? countTitle : (title | translate) }}
              </h3>
              <small
                [ngClass]="{ 'ml-8': !!counter }"
                class="text-muted fw-400 mt-5 custom-subtitle">
                {{ subText | translate }}
              </small>
            </div>
            <h3
              *ngIf="!subText"
              [ngClass]="{ 'ml-8': !!counter }"
              class="fw-400 align-self-center mt-0 mb-0 custom-title">
              {{ title | translate }}
            </h3>
          </div>

          <ng-container *ngIf="pillInfo?.text">
            <div
              class="d-flex justify-content-center pill"
              [ngClass]="{
                '--red': pillInfo?.color === 'red',
                '--green': pillInfo?.color === 'green',
                '--gray': pillInfo?.color === 'gray',
                '--orange': pillInfo?.color === 'orange'
              }">
              <mat-icon
                *ngIf="pillInfo?.icon"
                [svgIcon]="pillInfo.icon"
                class="mr-8"></mat-icon>
              <p class="mat-body-1 fw-400 m-0">
                {{ pillInfo.text | translate }}
              </p>
            </div>
          </ng-container>
        </mat-panel-title>
      </mat-expansion-panel-header>
      <div class="mb-10">
        <mat-divider></mat-divider>
      </div>
      <ng-content select="[container]"></ng-content>
    </mat-expansion-panel>
  `,
  styles: [
    `
      .counter {
        width: 24px;
        height: 24px;
        display: grid;
        place-items: center;
        border-radius: 50%;
      }
      .custom-title {
        font-family: Open Sans;
        font-size: 20px;
        font-weight: 400;
        line-height: 32px;
        text-align: left;
        color: #221f1f !important;
      }

      .custom-subtitle {
        font-size: 14px;
        color: #666;
      }

      /* Example of changing colors based on the component state */
      mat-expansion-panel-header[aria-expanded='true'] .custom-title {
        color: #007bff; /* Change title color when expanded */
      }

      mat-expansion-panel-header[aria-expanded='true'] .custom-subtitle {
        color: #0056b3; /* Change subtitle color when expanded */
      }

      .pill {
        border-radius: 32px;
        padding: 8px 12px;

        &.--red {
          background: linear-gradient(
              0deg,
              rgba(230, 0, 0, 0.1),
              rgba(230, 0, 0, 0.1)
            ),
            #ffffff;
          color: #e60000;
        }

        &.--green {
          background: linear-gradient(
              0deg,
              rgba(47, 152, 3, 0.1),
              rgba(47, 152, 3, 0.1)
            ),
            #ffffff;
          color: #2f9803;
        }

        &.--gray {
          background: linear-gradient(
              0deg,
              rgba(88, 89, 91, 0.1),
              rgba(88, 89, 91, 0.1)
            ),
            #ffffff;
          color: #58595b;
        }

        &.--orange {
          background: linear-gradient(
              0deg,
              rgba(243, 135, 7, 0.1),
              rgba(243, 135, 7, 0.1)
            ),
            #ffffff;
          color: #f38707;
        }
      }
    `,
  ],
})
export class CollapsibleComponent {
  @Input() title!: string;
  @Input() countTitle!: string;
  @Input() subText!: string;
  @Input() counter!: number;
  @Input() hideToggle = false;
  @Input() showDivider = true;
  @Input() expandedHeight = '64px';
  @Input() collapsedHeight = '64px';
  @Input() pillInfo!: { color: string; text: string; icon: string };
  @Input() activeControl: AbstractControl = new UntypedFormControl('');
  @Input() validControl: AbstractControl = new UntypedFormControl('');

  @Input()
  get isValid(): boolean {
    return this._isValidOverride === null
      ? this._getDefaultIsValid()
      : this._isValidOverride;
  }

  set isValid(value: BooleanInput) {
    this._isValidOverride = coerceBooleanProperty(value);
  }

  _isValidOverride: boolean | null = null;

  private _getDefaultIsValid() {
    return this.validControl?.valid;
  }

  @Input()
  get isActive(): boolean {
    return this._isActiveOverride === null
      ? this._getDefaultIsActive()
      : this._isActiveOverride;
  }

  set isActive(value: BooleanInput) {
    this._isActiveOverride = coerceBooleanProperty(value);
  }

  private _isActiveOverride: boolean | null = null;

  private _getDefaultIsActive() {
    return this.activeControl?.valid;
  }
}
