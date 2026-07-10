import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pills',
  template: '<ng-content></ng-content>',
  imports: [CommonModule],
})
export class PillsComponent {}
