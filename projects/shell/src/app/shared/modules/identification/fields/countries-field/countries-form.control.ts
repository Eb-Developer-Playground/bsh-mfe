import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  UntypedFormControl,
  ValidationErrors,
} from '@angular/forms';

import { map, startWith, takeUntil } from 'rxjs/operators';
import { Observable, Subject } from 'rxjs';
import { ICountry } from '../../types';
import { StaticDataService } from '../../../../services/static-data.service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-countries-control',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatInputModule,
    MatOptionModule,
    ReactiveFormsModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: CountriesFormControl,
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: CountriesFormControl,
      multi: true,
    },
  ],
  templateUrl: './countries-form.control.html',
  styleUrls: ['./countries-form.control.scss'],
  // host: {
  //     '(change)': '_onChange?.($event.target.value)',
  //     '(blur)': '_onTouched?.()'
  // }
})
export class CountriesFormControl
  implements ControlValueAccessor, OnInit, OnDestroy
{
  @ViewChild('input') inputEl!: ElementRef<HTMLInputElement>;
  @Input() label = 'Country of residence';
  @Input() hint!: string;
  @Input() placeholder!: string;
  countries: Array<ICountry> = [];
  filteredCountries!: Observable<ICountry[]>;
  inputControl: UntypedFormControl = new UntypedFormControl();

  private _value!: string;
  _onChange?: (value: string) => void;
  _onTouched?: () => void;
  _disabled?: boolean;

  destroy$: Subject<any> = new Subject<any>();

  get value() {
    return this._value;
  }

  set value(value: string) {
    this._value = value;
    this.inputControl.setValue(
      this.countries?.find(c => c.countryCode === value)?.countryName || value
    );
    this._onChange?.(value);
    this._onTouched?.();
  }

  constructor(private dataService: StaticDataService) {}

  ngOnInit() {
    this.dataService.getCountries().subscribe(data => {
      this.countries = data.map((country: ICountry) => {
        country.countryName = country.countryName.toUpperCase();
        return country;
      });
      if (this._value) this.value = this._value;
      this.filteredCountries = this.inputControl.valueChanges.pipe(
        takeUntil(this.destroy$),
        startWith(''),
        map(value => {
          return this.countries.filter(option =>
            option.countryName.toLowerCase()?.includes(value?.toLowerCase())
          );
        })
      );
    });
  }

  ngOnDestroy() {
    this.destroy$.next('');
    this.destroy$.complete();
  }

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

  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) {
      this.inputControl.setErrors({ required: true });
      return { required: true };
    }
    if (
      value &&
      !this.countries.find(
        c => c.countryCode.toUpperCase() === value?.toUpperCase()
      )
    ) {
      this.inputControl.setErrors({ invalid: true });
      return { invalid: true };
    }
    return null;
  }

  onSelectValue(v?: any) {
    const hit = this.countries.find(
      c => c.countryName.toUpperCase() === v?.toUpperCase()
    );
    // if (hit)
    //     this.value = hit?.countryCode || "";
    if (hit) {
      this.value = hit?.countryCode;
    } else {
      if (v?.length > 2) this.value = v;
    }
  }
}
