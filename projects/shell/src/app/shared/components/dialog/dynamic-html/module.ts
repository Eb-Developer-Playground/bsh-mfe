import { NgModule, ModuleWithProviders, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicHTMLComponent } from './dynamic-html.component';
import { DynamicHTMLOptions } from './options';
import { DynamicHTMLRenderer } from './renderer';

@NgModule({
  imports: [CommonModule, DynamicHTMLComponent],
  exports: [DynamicHTMLComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DynamicHTMLModule {
  static forRoot(options: DynamicHTMLOptions): ModuleWithProviders<any> {
    return {
      ngModule: DynamicHTMLModule,
      providers: [
        DynamicHTMLRenderer,
        { provide: DynamicHTMLOptions, useValue: options },
      ],
    };
  }
}
