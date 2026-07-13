import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-collapsible',
  imports: [MatExpansionModule, MatDividerModule, MatIconModule],
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
            @if (!isActive) {
              <span class="counter color-white bg-grey align-self-center">
                {{ counter }}
              </span>
            }
            @if (!isValid && isActive) {
              <span class="counter color-white bg-primary align-self-center">
                {{ counter }}
              </span>
            }
            @if (isValid && isActive) {
              <span class="counter align-self-center">
                <mat-icon
                  style="width: 24px; height: 24px;"
                  svgIcon="ic-section-done"></mat-icon>
              </span>
            }
            @if (subText) {
              <div>
                <h3 class="fw-400 align-self-center ml-8 mb-0 mt-0">
                  {{ title }}
                </h3>
                <small class="text-muted fw-400 ml-8 mt-5">{{ subText }}</small>
              </div>
            }
            @if (!subText) {
              <h3 class="mat-headline-6 fw-400 align-self-center ml-8 mb-0">
                {{ title }}
              </h3>
            }
          </div>
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
    `,
  ],
})
export class CollapsibleComponent implements OnInit {
  @Input() title!: string;
  @Input() subText!: string;
  @Input() counter!: number;
  @Input() hideToggle = false;
  @Input() showDivider = true;
  @Input() expandedHeight = '64px';
  @Input() collapsedHeight = '64px';
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

  constructor() {}

  ngOnInit(): void {}
}
