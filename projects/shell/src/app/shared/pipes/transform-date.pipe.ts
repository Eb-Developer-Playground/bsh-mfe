import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'transformDate',
  standalone: true,
})
export class TransformDatePipe implements PipeTransform {
  transform(value: unknown): string {
    if (!value) return '';
    const date = new Date(value as string);
    if (isNaN(date.getTime())) return ''; 
    return format(date, 'yyyy-MM-dd'); 
  }
}