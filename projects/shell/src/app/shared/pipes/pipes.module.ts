import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterSpecCharsPipe } from './special-chars.pipe';
import { TransformPhoneTypePipe } from './transform-phone-type.pipe';
import { TransformPhoneNumberPipe } from './transform-phone-number.pipe';
import { TransformEmailPipe } from './transform-email.pipe';
import { TransformCityPipe } from './transform-city.pipe';
import { TransformCountyPipe } from './transform-county.pipe';
import { TransformReligionPipe } from './transform-religion.pipe';
import { TransformProfessionPipe } from './transform-profession.pipe';
import { TransformJobTitlePipe } from './transform-job-title.pipe';

@NgModule({
  declarations: [
    FilterSpecCharsPipe,
    TransformPhoneTypePipe,
    TransformPhoneNumberPipe,
    TransformEmailPipe,
    TransformCityPipe,
    TransformCountyPipe,
    TransformReligionPipe,
    TransformProfessionPipe,
    TransformJobTitlePipe,
  ],
  exports: [
    FilterSpecCharsPipe,
    TransformPhoneTypePipe,
    TransformPhoneNumberPipe,
    TransformEmailPipe,
    TransformCityPipe,
    TransformCountyPipe,
    TransformReligionPipe,
    TransformProfessionPipe,
    TransformJobTitlePipe,
  ],
  imports: [CommonModule],
  providers: [FilterSpecCharsPipe],
})
export class PipesModule {}
