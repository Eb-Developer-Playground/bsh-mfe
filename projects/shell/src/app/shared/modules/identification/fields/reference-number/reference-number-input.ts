/* eslint-disable @angular-eslint/no-input-rename */
import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  NgControl,
  ReactiveFormsModule,
  UntypedFormControl,
} from '@angular/forms';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';
import { Subject } from 'rxjs';

@Component({
  standalone: true,
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'reference-number-input',
  templateUrl: 'reference-number-input.html',
  styleUrls: ['reference-number-input.scss'],
  providers: [
    { provide: MatFormFieldControl, useExisting: ReferenceNumberInput },
  ],
  host: {
    '[class.reference-number-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
  imports: [ReactiveFormsModule],
})
export class ReferenceNumberInput
  implements ControlValueAccessor, MatFormFieldControl<string>, OnDestroy
{
  static nextId = 0;
  @ViewChild('input') inputElement!: HTMLInputElement;

  refNumCtl = new UntypedFormControl('');
  stateChanges = new Subject<void>();
  focused = false;
  touched = false;
  controlType = 'reference-number-input';
  id = `reference-number-input-${ReferenceNumberInput.nextId++}`;
  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    return !this.refNumCtl.getRawValue();
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input('aria-describedby') userAriaDescribedBy!: string;

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }

  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }

  private _placeholder!: string;

  @Input()
  get required(): boolean {
    return this._required;
  }

  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }

  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.refNumCtl.disable() : this.refNumCtl.enable();
    this.stateChanges.next();
  }

  private _disabled = false;

  @Input()
  get value(): string | null {
    if (this.refNumCtl.valid) {
      return this.refNumCtl.value;
    }
    return null;
  }

  set value(num: string | null) {
    this.refNumCtl.setValue(num);
    this.stateChanges.next();
  }

  get errorState(): boolean {
    return this.refNumCtl.invalid && this.touched;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn(event: FocusEvent) {
    if (!this.focused) {
      this.focused = true;
      this.stateChanges.next();
    }
  }

  onFocusOut(event: FocusEvent) {
    if (
      !this._elementRef.nativeElement.contains(event.relatedTarget as Element)
    ) {
      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.reference-number-input-container'
    );
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick() {
    this._focusMonitor.focusVia(this.inputElement, 'program');
  }

  writeValue(val: string | null): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  _handleInput(control: AbstractControl, nextElement?: HTMLInputElement): void {
    this.onChange(this.value);
  }
}
