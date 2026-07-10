import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformProfession',
  standalone: false,
})
export class TransformProfessionPipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): any {
    const dropdownValues: any = args[0];
    const occupations = dropdownValues.occupation;
    const found = occupations.find((el: any) => el.code === value);
    if (found) return found.codeDesc;
    else return value;
  }
}
