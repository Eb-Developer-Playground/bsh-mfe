import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'idType',
})
export class IdTypePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }
}
