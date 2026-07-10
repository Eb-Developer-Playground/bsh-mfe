import { Component,
  ElementRef,
  Input,
  SimpleChanges,
  OnChanges,
  OnDestroy,
  DoCheck, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

import { DynamicHTMLRenderer, DynamicHTMLRef } from './renderer';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'dynamic-html',
  template: '',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DynamicHTMLComponent implements DoCheck, OnChanges, OnDestroy {
  @Input() content!: string;

  private ref: DynamicHTMLRef | any;

  constructor(
    private renderer: DynamicHTMLRenderer,
    private elementRef: ElementRef
  ) {}

  ngOnChanges(_: SimpleChanges) {
    if (this.ref) {
      this.ref.destroy();
      this.ref = null;
    }
    if (this.content && this.elementRef) {
      this.ref = this.renderer.renderInnerHTML(this.elementRef, this.content);
    }
  }

  ngDoCheck() {
    if (this.ref) {
      this.ref.check();
    }
  }

  ngOnDestroy() {
    if (this.ref) {
      this.ref.destroy();
      this.ref = null;
    }
  }
}
