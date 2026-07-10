import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ShowIsfeatureIsEnabledDirective } from './directive/show-isfeature-is-enabled.directive';

@NgModule({
  declarations: [ShowIsfeatureIsEnabledDirective],
  imports: [CommonModule],
  exports: [ShowIsfeatureIsEnabledDirective],
})
export class HandlerAccessFeatureModule {}
