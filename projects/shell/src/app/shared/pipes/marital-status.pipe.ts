import { Pipe, PipeTransform } from '@angular/core';

const STATUSES = [
  {
    code: '004',
    codeDesc: 'DIVORCED',
  },
  {
    code: 'MAR',
    codeDesc: 'MARRIED',
  },
  {
    code: '002',
    codeDesc: 'MARRIED',
  },
  {
    code: '003',
    codeDesc: 'SEPARATED',
  },
  {
    code: '001',
    codeDesc: 'SINGLE',
  },
  {
    code: '005',
    codeDesc: 'WIDOWED',
  },
];

@Pipe({
  name: 'maritalStatus',
})
export class MaritalStatusPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const found = STATUSES.find((el: any) => el.code === value);
    if (found) return found.codeDesc;
    else return value;
  }
}
