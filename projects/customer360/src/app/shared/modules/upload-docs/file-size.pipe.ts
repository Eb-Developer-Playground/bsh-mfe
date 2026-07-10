import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  private units = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

  transform(bytes = 0, precision = 2, useBase10 = false ,includeDecimals = true): string {
    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) return '?';
  
    let unit = 0;
    const divisor = useBase10 ? 1000 : 1024;

    while (bytes >= divisor && unit < this.units.length - 1) {
      bytes /= divisor;
      unit++;
    }

    // If precision is 0, show no decimals
    const formatted = precision === 0 ? Math.round(bytes).toString() : bytes.toFixed(precision);

    return `${formatted} ${this.units[unit]}`;
  }
  
}
