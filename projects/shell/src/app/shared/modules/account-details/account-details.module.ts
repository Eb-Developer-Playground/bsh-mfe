import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PipesModule } from '../../pipes/pipes.module';
import { MaterialModule } from './material.module';
import { AccountDetailsComponent } from './account-details.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [AccountDetailsComponent],
  imports: [CommonModule, MaterialModule, PipesModule, TranslateModule],
  exports: [AccountDetailsComponent],
})
export class AccountDetailsModule {}
