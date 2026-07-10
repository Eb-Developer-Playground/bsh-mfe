/* eslint-disable @angular-eslint/no-input-rename */
import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Self,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  NgControl,
  ControlValueAccessor,
  ReactiveFormsModule,
  ValidationErrors,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { Observable, of, Subject } from 'rxjs';
import { SearchableItem } from './types';
import { validValue } from './validators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'searchable-control',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatOptionModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  providers: [
    {
      provide: MatFormFieldControl,
      useExisting: SearchableFormControl,
    },
  ],
  templateUrl: './searchable.control.html',
  styleUrls: ['./searchable.control.scss'],
  host: {
    '[id]': 'id',
    '[class.search-input-floating]': 'shouldLabelFloat',
    // '(change)': '_onChange?.($event.target.value)',
    // '(blur)': '_onTouched?.()'
  },
})
export class SearchableFormControl<T extends SearchableItem>
  implements
    ControlValueAccessor,
    MatFormFieldControl<string>,
    OnInit,
    OnDestroy
{
  static nextId = 0;
  @ViewChild('input') inputEl!: ElementRef<HTMLInputElement>;
  @Input() label = 'Search items';
  @Input() hint!: string;
  @Input() dataSource: Observable<Array<T>> = of([]);
  _items: Array<T> = [];
  filteredItems!: Observable<Array<T>>;
  inputControl: UntypedFormControl = new UntypedFormControl();

  _onChange?: (value: string) => void;
  _onTouched?: () => void;

  focused = false;
  touched = false;
  stateChanges = new Subject<void>();
  destroy$: Subject<any> = new Subject<any>();

  id = `search-control-${SearchableFormControl.nextId++}`;

  controlType = 'search-control';

  get empty() {
    return !this.inputControl.value;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  get errorState(): boolean {
    return this.inputControl.invalid && this.touched;
  }

  @Input('aria-describedby') userAriaDescribedBy!: string;

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef?.nativeElement.querySelector(
      '.search-input-container'
    );
    controlElement?.setAttribute('aria-describedby', ids.join(' '));
  }

  @Input()
  get placeholder(): string {
    return this._placeholder;
  }
  set placeholder(value: string) {
    this._placeholder = value;
    this.stateChanges.next();
  }
  private _placeholder!: string;

  get value() {
    return this._value;
  }
  set value(value: string) {
    this._value = value;
    this.inputControl.setValue(
      this._items.find(i => i.toInternal() === this._value)?.toString() ?? value
    );
    this._onChange?.(value);
    this._onTouched?.();
    this.stateChanges.next();
  }
  private _value!: string;

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
    this._disabled ? this.inputControl.disable() : this.inputControl.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

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
      this._onTouched?.();
      this.stateChanges.next();
    }
  }

  constructor(
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl != null) {
      this.ngControl.valueAccessor = this;
    }
  }

  ngOnInit() {
    this.dataSource?.pipe(takeUntil(this.destroy$)).subscribe(data => {
      this._items = data;
      if (this._value) this.value = this._value;
      const isRequired = this.inputControl.hasValidator(Validators.required);
      this.inputControl.clearValidators();
      this.inputControl.addValidators(validValue(data));
      if (isRequired) this.inputControl.addValidators(Validators.required);
      this.inputControl.updateValueAndValidity();
      this.stateChanges.next();
      this.filteredItems = this.inputControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        startWith(''),
        map(value => {
          return this._items.filter(o =>
            o
              .toString()
              .toLowerCase()
              ?.includes(
                value?.toString()?.toLowerCase() || value?.toLowerCase()
              )
          );
        })
      );
    });
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  onContainerClick(event: MouseEvent) {}

  writeValue(val: any): void {
    this.value = val;
  }

  registerOnChange(fn: any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }

  onSelectValue(v?: any) {
    const hit = this._items.find(
      c => c.toString().toUpperCase() === v?.toUpperCase()
    );
    if (hit) {
      this.value = hit.toInternal();
    } else {
      if (v?.length > 2) this.value = v;
    }
  }
}
