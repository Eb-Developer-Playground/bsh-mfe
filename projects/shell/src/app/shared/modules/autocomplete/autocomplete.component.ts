import { AfterViewInit,
  Component,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  AbstractControl,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';

import { from, Observable } from 'rxjs';
import { delay, map, startWith } from 'rxjs/operators';
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-autocomplete',
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class AutocompleteComponent implements OnInit, AfterViewInit {
  @ViewChild('auto') autoComplete!: MatAutocomplete;
  @ViewChild('trigger', { read: MatAutocompleteTrigger })
  trigger!: MatAutocompleteTrigger;
  @Input() form!: UntypedFormGroup;
  @Input() label!: string;
  @Input() valueKey!: string;
  @Input() labelKey!: string;
  @Input() controlName!: string;
  @Input() placeholderText = 'Enter';
  @Input() options: any[] = [];
  formControl!: UntypedFormControl;
  filteredOptions!: Observable<any[]>;

  hideComponent = true;
  private control!: AbstractControl;
  //@Input() marcaSelected: Marca[];

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit(): void {
    this.control = this.form.controls[this.controlName];
    this.formControl = this.control as UntypedFormControl;

    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value[this.valueKey] || value))
    );
  }

  ngAfterViewInit() {
    const isReady$ = from(this.IsReady());

    isReady$.pipe(delay(200)).subscribe(() => {
      this.trigger.closePanel();
      this.hideComponent = false;
    });
  }

  async IsReady() {
    const container = this.vcRef.element;
    const el = (await container.nativeElement.querySelector(
      'mat-form-field'
    )) as HTMLMediaElement;
    return el;
  }

  private _filter(value: any): string[] {
    const filterValue = (value[this.valueKey] || value).toLowerCase();

    return this.options.filter(option =>
      (option[this.valueKey] || option).toLowerCase().includes(filterValue)
    );
  }
}
