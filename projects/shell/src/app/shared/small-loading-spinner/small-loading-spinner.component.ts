import { Component, input, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { COMPAT_IMPORTS } from '../compat-barrel';

@Component({
  selector: "app-small-loading-spinner",
  standalone: true,
  imports: [MatProgressSpinnerModule],
  template: `
    <mat-spinner 
      [diameter]="diameter()" 
      class="inherited-color">
    </mat-spinner>
  `,
  styles: `
    :host {
      display: flex;
    }
    :host ::ng-deep .mdc-circular-progress__indeterminate-circle-graphic,
    :host ::ng-deep .mdc-circular-progress__determinate-circle {
      stroke: currentColor;
    }
  `
})
export class SmallLoadingSpinnerComponent {
  diameter = input<number>(20); // Default size for buttons
}
