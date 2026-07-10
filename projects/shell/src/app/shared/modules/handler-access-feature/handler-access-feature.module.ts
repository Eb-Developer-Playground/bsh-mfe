import { CommonModule } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ShowIsfeatureIsEnabledDirective } from './directive/show-isfeature-is-enabled.directive';

@NgModule({

  imports: [
      CommonModule,
      ShowIsfeatureIsEnabledDirective,
    ],
  exports: [ShowIsfeatureIsEnabledDirective],
schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class HandlerAccessFeatureModule {}
