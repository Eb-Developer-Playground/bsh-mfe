import { Pipe, PipeTransform } from '@angular/core';
import { default as ACTIONS } from '../../../../../assets/data/profileactions.json';

@Pipe({
  name: 'transformProfileAction',
  standalone: true,
})
export class TransformProfileActionPipe implements PipeTransform {
  transform(value: string, ...args: unknown[]): string {
    return (
      (ACTIONS as { key: string; value: string }[]).find(i => i.key === value)
        ?.value || value
    );
  }
}
