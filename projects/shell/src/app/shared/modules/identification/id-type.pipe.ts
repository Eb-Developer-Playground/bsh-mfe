import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idType',
  standalone: true,
})
export class IdTypePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
