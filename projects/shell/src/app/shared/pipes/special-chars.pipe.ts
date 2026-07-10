import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterSpecChars',
  standalone: false,
})
export class FilterSpecCharsPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/[^0-9A-Za-z .,-]/g, '').replace(/\s/g, ' ');
  }
}
