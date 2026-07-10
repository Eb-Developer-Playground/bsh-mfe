import { Directive, Input } from '@angular/core';

@Directive({
  selector: '[fxLayout]',
  standalone: false,
})
export class FlexLayoutDirective {
  @Input('fxLayout') layout: string = '';
}

@Directive({
  selector: '[fxLayoutAlign]',
  standalone: false,
})
export class FlexLayoutAlignDirective {
  @Input('fxLayoutAlign') align: string = '';
}

@Directive({
  selector: '[fxLayoutGap]',
  standalone: false,
})
export class FlexLayoutGapDirective {
  @Input('fxLayoutGap') gap: string = '';
}

@Directive({
  selector: '[fxFlex]',
  standalone: false,
})
export class FlexFlexDirective {
  @Input('fxFlex') flex: string = '';
}

@Directive({
  selector: '[fxFlexFill]',
  standalone: false,
})
export class FlexFlexFillDirective {}

@Directive({
  selector: '[fxHide]',
  standalone: false,
})
export class FlexHideDirective {
  @Input('fxHide') hide: boolean | string = false;
}

@Directive({
  selector: '[fxShow]',
  standalone: false,
})
export class FlexShowDirective {
  @Input('fxShow') show: boolean | string = true;
}
