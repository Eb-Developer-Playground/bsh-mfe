import { Pipe, PipeTransform } from '@angular/core';
import { default as SUBSIDIARIES } from '../../../assets/data/subsidiaries.json';

@Pipe({
  name: 'transformSubsidiary',
  standalone: true,
})
export class TransformSubsidiaryPipe implements PipeTransform {
  transform(value: any): string {
    if (['43', 'CD'].includes(value))
      // Truncated name, too long
      return 'DR Congo';
    return (
      SUBSIDIARIES.responseObject.find(
        c => c.countryCode === value.trim() || c.bankId === value.trim()
      )?.countryName || value
    );
  }
}
