import { Pipe, PipeTransform } from '@angular/core';

const GENDERS = [
  {
    code: 'F',
    codeDesc: 'Female',
  },
  {
    code: 'M',
    codeDesc: 'Male',
  },
];

@Pipe({
  name: 'gender',
})
export class GenderPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const found = GENDERS.find((el: any) => el.code === value);
    if (found) return found.codeDesc;
    else return value;
  }
}
