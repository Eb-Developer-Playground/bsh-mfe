import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformPhoneType',
  standalone: false,
})
export class TransformPhoneTypePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const phoneTypes = [
      {
        value: 'HOMEPH1',
        localetext: 'Home Phone 1',
      },
      {
        value: 'HOMEPH2',
        localetext: 'Home Phone 2',
      },
      {
        value: 'WORKPH1',
        localetext: 'Work Phone 1',
      },
      {
        value: 'WORKPH2',
        localetext: 'Work Phone 2',
      },
      {
        value: 'COMMPH1',
        localetext: 'Communication Phone 1',
      },
      {
        value: 'COMMPH2',
        localetext: 'Equitel Phone No',
      },
      {
        value: 'TELEX',
        localetext: 'Telex',
      },
      {
        value: 'FAX1',
        localetext: 'Fax 1',
      },
      {
        value: 'FAX2',
        localetext: 'Fax 2',
      },
      {
        value: 'PAGER',
        localetext: 'Pager',
      },
      {
        value: 'REGPH1',
        localetext: 'Registered Phone 1',
      },
      {
        value: 'REGPH2',
        localetext: 'Registered Phone 2',
      },
      {
        value: 'CELLPH',
        localetext: 'Cell Phone',
      },
      {
        value: 'NREPHONE',
        localetext: 'NRE Phone',
      },
      {
        value: 'HOMETELEX',
        localetext: 'Home Telex',
      },
      {
        value: 'COMMTELEX',
        localetext: 'Communication Telex',
      },
      {
        value: 'CAT200001',
        localetext: 'Cell Phone 3',
      },
      {
        value: 'CAT200009',
        localetext: 'Communication Phone 3',
      },
    ];
    const found = phoneTypes.find((el: any) => el.value === value);
    if (found) return found.localetext;
    else return value;
  }
}
