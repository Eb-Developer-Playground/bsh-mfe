import { Pipe, PipeTransform } from '@angular/core';
import { default as ProfileActions } from '../../../assets/data/profileactions.json';

@Pipe({
  name: 'profileActions',
})
export class ProfileActionsPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return (
      (ProfileActions as { key: string; value: string }[]).find(
        i => i.key === value
      )?.value || value
    );
  }
}
