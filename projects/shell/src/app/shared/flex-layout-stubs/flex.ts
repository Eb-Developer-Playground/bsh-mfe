import { NgModule } from '@angular/core';
import {
  FlexLayoutDirective,
  FlexLayoutAlignDirective,
  FlexLayoutGapDirective,
  FlexFlexDirective,
  FlexFlexFillDirective,
  FlexHideDirective,
  FlexShowDirective,
} from './flex-directives';

@NgModule({
  declarations: [
    FlexLayoutDirective,
    FlexLayoutAlignDirective,
    FlexLayoutGapDirective,
    FlexFlexDirective,
    FlexFlexFillDirective,
    FlexHideDirective,
    FlexShowDirective,
  ],
  exports: [
    FlexLayoutDirective,
    FlexLayoutAlignDirective,
    FlexLayoutGapDirective,
    FlexFlexDirective,
    FlexFlexFillDirective,
    FlexHideDirective,
    FlexShowDirective,
  ],
})
export class FlexModule {}
