import {
  Injectable,
  Injector,
  ElementRef,
  ComponentRef,
  EnvironmentInjector,
  createComponent,
  Type,
  inject,
} from '@angular/core';
import { DynamicHTMLOptions } from './options';
import { OnMount } from './interfaces';

export interface DynamicHTMLRef {
  check: () => void;
  destroy: () => void;
}

function isBrowserPlatform() {
  return window != null && window.document != null;
}

@Injectable()
export class DynamicHTMLRenderer {
  private componentClasses = new Map<string, Type<any>>();

  private componentRefs = new Map<any, Array<ComponentRef<any>>>();
  private environmentInjector = inject(EnvironmentInjector);

  constructor(
    private options: DynamicHTMLOptions,
    private injector: Injector
  ) {
    this.options.components.forEach(({ selector, component }) => {
      this.componentClasses.set(selector, component);
    });
  }

  renderInnerHTML(elementRef: ElementRef, html: string): DynamicHTMLRef {
    if (!isBrowserPlatform()) {
      return {
        check: () => {},
        destroy: () => {},
      };
    }
    elementRef.nativeElement.innerHTML = html;

    const componentRefs: Array<ComponentRef<any>> = [];
    this.options.components.forEach(({ selector }) => {
      const elements = (elementRef.nativeElement as Element).querySelectorAll(
        selector
      );
      Array.prototype.forEach.call(elements, (el: Element) => {
        const content = el.innerHTML;
        const componentClass = this.componentClasses.get(selector);
        if (!componentClass) return;

        const cmpRef = createComponent(componentClass, {
          environmentInjector: this.environmentInjector,
          elementInjector: this.injector,
        });
        const hostEl = cmpRef.location.nativeElement as Element;
        el.parentNode?.replaceChild(hostEl, el);

        if (cmpRef.instance.dynamicOnMount) {
          const attrsMap = new Map<string, string>();
          if (el.hasAttributes()) {
            Array.prototype.forEach.call(el.attributes, (attr: Attr) => {
              attrsMap.set(attr.name, attr.value);
            });
          }
          (cmpRef.instance as OnMount).dynamicOnMount(attrsMap, content, hostEl);
        }

        // @ts-ignore
        componentRefs.push(cmpRef);
      });
    });
    this.componentRefs.set(elementRef, componentRefs);
    return {
      check: () =>
        componentRefs.forEach(ref => ref.changeDetectorRef.detectChanges()),
      destroy: () => {
        componentRefs.forEach(ref => ref.destroy());
        this.componentRefs.delete(elementRef);
      },
    };
  }
}
