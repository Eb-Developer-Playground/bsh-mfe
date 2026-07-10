import { NgModule } from '@angular/core';
import { NumberFormatDirective } from './number-format.directive';
// import {NumberFormatDirective} from "@app/shared/modules/identification/number-format.directive";

@NgModule({
  declarations: [NumberFormatDirective],
  exports: [NumberFormatDirective],
})
export class NumberFormatModule {}
