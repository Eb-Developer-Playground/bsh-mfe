import { NgModule } from '@angular/core';
import { CompatImportsModule } from '../../shared/compat-barrel';

@NgModule({
  imports: [CompatImportsModule],
  exports: [CompatImportsModule],
})
export class MaterialModule {}
