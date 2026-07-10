import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformCounty',
  standalone: false,
})
export class TransformCountyPipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): any {
    const dropdownValues: any = args[0];
    const counties = dropdownValues.county.filter(
      (county: any) => !county.isDeleted
    );
    const found = counties.find((el: any) => el.ref_Code === value);
    if (found) return found.ref_Desc;
    else return value;
  }
}
