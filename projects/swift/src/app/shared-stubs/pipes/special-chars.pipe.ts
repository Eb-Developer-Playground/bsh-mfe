// Stub for @shared/pipes/special-chars.pipe
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterSpecChars' })
export class FilterSpecCharsPipe implements PipeTransform {
  transform(value: string): string { return value || ''; }
}
