import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformEmail',
  standalone: false,
})
export class TransformEmailPipe implements PipeTransform {
  transform(
    emailAddresses:
      | {
          id: string;
          emailAddress: string;
          emailType: string;
          comment: null;
          preferred: boolean;
          toBeDeleted: boolean;
        }[] /*INDIVIDUAL INTERFACE */
      | {
          id: string;
          emailAddress: string;
          emailType: string;
          comment: null;
          preferred: boolean;
        }[] /*INDIVIDUAL ENTITY */,
    preferred: 'PRIMARY' | 'SECONDARY' = 'PRIMARY'
  ): string {
    const _preferred = preferred === 'PRIMARY' ? true : false;

    const found = emailAddresses
      .map((item: any) => {
        return {
          emailAddress: item.emailAddress,
          preferred: item.preferred,
        };
      })
      .find(email => email.preferred === _preferred);
    if (found) return `${found.emailAddress}`;
    else return '';
  }
}
