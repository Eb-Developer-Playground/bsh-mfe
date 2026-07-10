import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';
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

@Component({
  selector: 'app-autocomplete',
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './autocomplete.component.html',
  styleUrls: ['./autocomplete.component.scss'],
})
export class AutocompleteComponent implements OnInit, AfterViewInit {
  formControl!: UntypedFormControl;
  filteredOptions!: Observable<string[]>;
  @Input() form!: UntypedFormGroup;
  @Input() label!: string;
  @Input() controlName!: string;
  @Input() options: string[] = [];

  @ViewChild('auto') autoComplete!: MatAutocomplete;
  @ViewChild('trigger', { read: MatAutocompleteTrigger })
  trigger!: MatAutocompleteTrigger;
  hideComponent = true;
  private control!: AbstractControl;
  //@Input() marcaSelected: Marca[];

  constructor(private vcRef: ViewContainerRef) {}

  ngOnInit(): void {
    this.control = this.form.controls[this.controlName];
    this.formControl = this.control as UntypedFormControl;

    this.filteredOptions = this.control.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
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

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter(option =>
      option.toLowerCase().includes(filterValue)
    );
  }
}
