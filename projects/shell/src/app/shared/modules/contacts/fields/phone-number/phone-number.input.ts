import { FocusMonitor } from '@angular/cdk/a11y';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  Self,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormBuilder,
  FormsModule,
  NgControl,
  ReactiveFormsModule,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from '@angular/material/form-field';
import { catchError, map, startWith, takeUntil } from 'rxjs/operators';
import { finalize, Observable, Subject } from 'rxjs';
import { ICountry, IPhoneNumber } from './types';
import { StaticDataService } from '../../../../services';
import { isValidCountryCode } from './validators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'phone-number-input',
  templateUrl: 'phone-number.input.html',
  styleUrls: ['phone-number.input.scss'],
  providers: [{ provide: MatFormFieldControl, useExisting: PhoneNumberInput }],
  host: {
    '[class.phone-number-floating]': 'shouldLabelFloat',
    '[id]': 'id',
  },
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
  ],
})
export class PhoneNumberInput
  implements
    ControlValueAccessor,
    MatFormFieldControl<IPhoneNumber>,
    OnInit,
    OnChanges,
    OnDestroy
{
  static nextId = 0;
  @ViewChild('country') countryInput!: HTMLInputElement;
  @ViewChild('city') cityCodeInput!: HTMLInputElement;
  @ViewChild('number') numberInput!: HTMLInputElement;
  @Input() collapsedMode: boolean = false;
  @Input() formGroup!: UntypedFormGroup;
  @Output() onCountrySelected: EventEmitter<any> = new EventEmitter<any>();
  countries: ICountry[] = [];
  filteredOptions!: Observable<ICountry[]>;
  stateChanges = new Subject<void>();
  countryCodeWidth: number = 24;
  focused = false;
  touched = false;
  controlType = 'phone-number-input';
  id = `phone-number-input-${PhoneNumberInput.nextId++}`;

  get selectedCountry() {
    return this.countries?.find(
      c =>
        !!c.dialCode && c.dialCode === this.formGroup.get('countryCode')?.value
    );
  }

  @Input()
  get localMode(): boolean {
    return ['254', '255', '256', '257', '211', '250', '243'].includes(
      <string>this.formGroup.get('countryCode')?.value
    );
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  get empty() {
    const {
      value: { countryCode, cityCode, number },
    } = this.formGroup;

    return this.localMode
      ? !countryCode && !cityCode && !number
      : !countryCode && !number;
  }

  get shouldLabelFloat() {
    return this.focused || !this.empty;
  }

  @Input() userAriaDescribedBy!: string;

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
    this._disabled ? this.formGroup.disable() : this.formGroup.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  get value(): IPhoneNumber {
    if (this.formGroup.valid) {
      const {
        value: { countryCode, cityCode, number },
      } = this.formGroup;
      return { countryCode, cityCode, number };
    }
    return { countryCode: '', cityCode: '', number: '' };
  }
  set value(tel: IPhoneNumber) {
    const { countryCode, cityCode, number } = tel;
    this.formGroup.setValue({ countryCode, cityCode, number });
    this.stateChanges.next();
    this.changeWidth();
    this.updateValidations();
  }

  get errorState(): boolean {
    return this.formGroup.invalid && this.touched;
  }

  constructor(
    private _http: HttpClient,
    private _formBuilder: FormBuilder,
    private _focusMonitor: FocusMonitor,
    private _dataService: StaticDataService,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
    this.formGroup = this._formBuilder.group({
      id: [''],
      type: ['COMMPH1'],
      countryCode: this._formBuilder.control(''),
      cityCode: this._formBuilder.control(''),
      number: this._formBuilder.control(''),
      isPreferred: [false],
      comment: [null],
      toBeDeleted: [false],
      isMandatory: [false],
    });
  }

  ngOnInit() {
    this._dataService
      .getCountriesInfo()
      .pipe(
        takeUntil(this.stateChanges),
        catchError(() =>
          this._http
            .get<any>('assets/data/subsidiaries.json')
            .pipe(map(res => res.responseObject))
        ),
        finalize(() => this.updateValidations())
      )
      .subscribe(data => {
        this.countries = data;
        this.countries.forEach(c => c.dialCode.replace(/\s/g, ''));
        this.formGroup
          .get('countryCode')
          ?.setValidators(
            this.required
              ? [Validators.required, isValidCountryCode(this.countries)]
              : []
          );
        this.formGroup
          .get('countryCode')
          ?.updateValueAndValidity({ emitEvent: false });
        this.formGroup
          .get('countryCode')
          ?.valueChanges.subscribe(() => this.updateValidations());
        this.filteredOptions = <Observable<any[]>>(
          this.formGroup.get('countryCode')?.valueChanges.pipe(
            startWith(''),
            map((v: any) => this._filter(v || ''))
          )
        );
        this.onCountrySelected.emit(this.selectedCountry);
      });
  }

  ngOnChanges(_changes: SimpleChanges) {
    const {
      value: { countryCode, number },
    } = this.formGroup;
    if (countryCode && number) {
      this.formGroup.get('countryCode')?.markAsTouched();
      this.formGroup.get('number')?.markAsTouched();
      this.formGroup.markAsTouched();
    }
  }

  updateValidations(): void {
    if (!this.formGroup.get('countryCode')?.value) {
      this.formGroup.get('cityCode')?.clearValidators();
      this.formGroup.get('number')?.clearValidators();
      return;
    }
    this.formGroup.get('cityCode')?.clearValidators();
    this.formGroup.get('number')?.clearValidators();
    if (this.localMode) {
      this.formGroup
        .get('cityCode')
        ?.setValidators([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(3),
        ]);
      this.formGroup
        .get('number')
        ?.setValidators([
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
        ]);
    } else {
      this.formGroup.get('cityCode')?.setValue(null);
      this.formGroup
        .get('number')
        ?.setValidators([
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(12),
        ]);
    }
    this.formGroup.get('cityCode')?.updateValueAndValidity();
    this.formGroup.get('number')?.updateValueAndValidity();
    this.onCountrySelected.emit(this.selectedCountry);
  }

  private _filter(value: string): ICountry[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(c =>
      c.dialCode.toLowerCase().includes(filterValue)
    );
  }

  ngOnDestroy() {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

  onFocusIn(_event: FocusEvent) {
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

  autoFocusNext(
    control: AbstractControl,
    nextElement?: HTMLInputElement
  ): void {
    if (!control.errors && nextElement) {
      this._focusMonitor.focusVia(nextElement, 'program');
    }
  }

  autoFocusPrev(control: AbstractControl, prevElement: HTMLInputElement): void {
    if (control.value.length < 1) {
      this._focusMonitor.focusVia(prevElement, 'program');
    }
  }

  setDescribedByIds(ids: string[]) {
    const controlElement = this._elementRef.nativeElement.querySelector(
      '.phone-number-input-container'
    )!;
    controlElement.setAttribute('aria-describedby', ids.join(' '));
  }

  onContainerClick(_event: MouseEvent) {
    if (this.empty) {
      this._focusMonitor.focusVia(this.countryInput, 'program');
      return;
    }

    if (this.formGroup.valid) {
      // Good
    } else if (this.formGroup.controls['countryCode'].valid) {
      this._focusMonitor.focusVia(this.cityCodeInput, 'program');
    } else if (this.formGroup.controls['cityCode'].valid) {
      this._focusMonitor.focusVia(this.numberInput, 'program');
    } else if (this.formGroup.controls['number'].valid) {
      this._focusMonitor.focusVia(this.countryInput, 'program');
    } else {
      this._focusMonitor.focusVia(this.countryInput, 'program');
    }
  }

  writeValue(tel: IPhoneNumber): void {
    this.value = tel;
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

  _handleInput(
    type: 'country' | 'city' | 'number',
    control: AbstractControl,
    nextElement?: HTMLInputElement
  ): void {
    if (this.localMode) {
      this.cityCodeInput.type = 'text';
    }
    if (this.localMode) {
      if (control.valid) {
        if (type === 'country' && control.valid) {
          this.autoFocusNext(control, nextElement);
        }
        if (type === 'city') {
          if (control.value.length === 3)
            this.autoFocusNext(control, nextElement);
        }
      }
    } else {
      if (control.valid) this.autoFocusNext(control, nextElement);
    }
    this.changeWidth();
    this.onChange(this.value);
  }

  handleKeyPress(e: KeyboardEvent) {
    // Safari fires Cmd + V through keyPress event
    if (e.key === 'v' && e.metaKey) {
      return true;
    }
    return /\d/.test(e.key);
  }

  changeWidth() {
    switch (this.formGroup.get('countryCode')?.value?.length) {
      case 1:
        this.countryCodeWidth = 10;
        break;
      case 2:
        this.countryCodeWidth = 20;
        break;
      case 3:
        this.countryCodeWidth = 24;
        break;
      case 4:
        this.countryCodeWidth = 32;
        break;
    }
  }
}
