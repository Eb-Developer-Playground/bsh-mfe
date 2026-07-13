import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appTanzaniaNationalIdFormat]',
  standalone: true,
})
export class TanzaniaNationalIdFormatDirective {
  @HostListener('input', ['$event'])
  @HostListener('paste', ['$event'])
  onInputChange(event: InputEvent | ClipboardEvent) {
    const input = event.target as HTMLInputElement;

    // Handle both pasted and typed input
    setTimeout(() => {
      input.value = this.formatNumber(input.value);
    }, 0);
  }

  private formatNumber(value: string): string {
    let trimmed = value.replace(/\s+/g, '').replace(/-/g, '');

    if (trimmed.length > 23) {
      trimmed = trimmed.substr(0, 23);
    }

    const numbers = [
      trimmed.substr(0, 8),
      trimmed.substr(8, 5),
      trimmed.substr(13, 5),
      trimmed.substr(18, 2),
    ].filter(segment => segment !== '');

    return numbers.join('-');
  }
}
