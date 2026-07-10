import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformReligion',
})
export class TransformReligionPipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): any {
    const dropdownValues: any = args[0];
    const religions = dropdownValues.religion;
    const found = religions.find((el: any) => el.code === value);
    if (found) return found.codeDesc;
    else return value;
  }
}
