import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NumberFormatDirective } from './number-format.directive';

@NgModule({
  imports: [NumberFormatDirective],
  exports: [NumberFormatDirective],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NumberFormatModule {}
