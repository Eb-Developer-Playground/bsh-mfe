import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Renderer2,
} from '@angular/core';
import { ID_TYPES } from './types';
import { IdDocumentService } from './id-document.service';

@Directive({
  selector: 'input[numberFormat]',
})
export class NumberFormatDirective {
  @Input() idType?: ID_TYPES;
  @Input() countryCode?: string;

  constructor(
    private _el: ElementRef,
    private renderer: Renderer2,
    private service: IdDocumentService
  ) {}

  @HostListener('input', ['$event']) onInputChange(event: {
    stopPropagation: () => void;
    target: any;
  }) {
    const isNumber =
      ![
        ID_TYPES.KenyanPassport,
        ID_TYPES.ForeignPassport,
        ID_TYPES.DriversLicense,
        ID_TYPES.RefugeeId,
        ID_TYPES.UNHCRPROOF,
        ID_TYPES.BirthCertificate,
        ID_TYPES.MilitaryServiceCard,
      ].includes(<ID_TYPES>this.idType) &&
      !['UG', 'RW', 'SS', 'TZ', 'CD'].includes(<string>this.countryCode);
    if (isNumber) {
      const start = event.target.selectionStart;
      const end = event.target.selectionEnd;
      const initialValue = this._el.nativeElement.value;
      this._el.nativeElement.value = initialValue.replace(/[^0-9]*/g, '');
      if (initialValue !== this._el.nativeElement.value) {
        event.stopPropagation();
      }
      event.target.setSelectionRange(start, end);
    }
    const config = this.service.docSpecs.find(
      d => d.idType === this.idType && d.countryCode === this.countryCode
    );
    if (config) {
      if (config.maxLength)
        this.renderer.setAttribute(
          this._el.nativeElement,
          'maxlength',
          `${config.maxLength}`
        );
      if (config.minLength)
        this.renderer.setProperty(
          this._el.nativeElement,
          'minlength',
          `${config.minLength}`
        );
      if (config.pattern)
        this.renderer.setProperty(
          this._el.nativeElement,
          'pattern',
          `${config.pattern}`
        );
    }
  }
}
