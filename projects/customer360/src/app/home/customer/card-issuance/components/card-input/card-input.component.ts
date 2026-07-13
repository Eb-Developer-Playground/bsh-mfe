import {
  Component,
  inject,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  ControlContainer,
  UntypedFormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AsyncPipe, NgSwitch, NgSwitchCase, NgSwitchDefault, NgFor, NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { LoadingSectionComponent } from '@app/home/customer/card-issuance/components/loading-section/loading-section.component';

@Component({
  selector: 'app-card-input',
  templateUrl: './card-input.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './card-input.component.scss',
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  imports: [
    ReactiveFormsModule,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    NgFor,
    NgIf,
    AsyncPipe,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    LoadingSectionComponent,
  ],
})
export class CardInputComponent implements OnInit, OnChanges {
  @Input() type = 'text';
  @Input() inputType: 'normal' | 'dropdown' | 'searchable-dropdown' = 'normal';
  @Input() options: {
    value: string;
    label: string;
  }[] = [];
  @Input() isRequired: boolean = false;
  @Input() isLoading: boolean = false;
  @Input() name: string = '';
  @Input() label: string = '';
  @Input() hint: string = '';

  filteredOptions!: Observable<{ value: string; label: string }[]>;
  searchControl = new UntypedFormControl();
  parentContainer = inject(ControlContainer);

  get parentFormGroup(): FormGroup {
    return this.parentContainer.control as FormGroup;
  }

  ngOnInit() {
    this.setupSearchableDropdown();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inputType'] || changes['options']) {
      this.setupSearchableDropdown();
    }
  }

  private setupSearchableDropdown() {
    if (this.inputType === 'searchable-dropdown') {
      this.filteredOptions = this.searchControl.valueChanges.pipe(
        startWith(''),
        map(value => {
          const searchValue = String(value || '');
          const filtered = this._filterOptions(searchValue);
          return filtered;
        })
      );
      this.initializeFormValue();
    }
  }

  private initializeFormValue() {
    const currentValue = this.parentFormGroup?.get(this.name)?.value;
    if (currentValue && this.options?.length > 0) {
      const selectedOption = this.options.find(
        opt => opt.value === currentValue
      );
      if (selectedOption) {
        this.searchControl.setValue(selectedOption.label, {
          emitEvent: false,
        });
      }
    }
  }

  private _filterOptions(
    searchValue: string
  ): { value: string; label: string }[] {
    if (!this.options || !Array.isArray(this.options)) {
      return [];
    }
    if (!searchValue || searchValue.trim() === '') {
      return [...this.options];
    }
    const filterValue = searchValue.toLowerCase().trim();
    const filtered = this.options.filter(option => {
      if (!option || typeof option !== 'object') return false;
      const label = String(option.label || '').toLowerCase();
      const value = String(option.value || '').toLowerCase();
      const matches =
        label.includes(filterValue) || value.includes(filterValue);
      return matches;
    });
    return filtered;
  }

  onOptionSelected(option: { value: string; label: string }) {
    this.searchControl.setValue(option.label, { emitEvent: false });
    this.parentFormGroup.get(this.name)?.setValue(option.value);
    this.parentFormGroup.get(this.name)?.markAsTouched();
  }

  onFocus() {
    if (!this.searchControl.value) {
      this.searchControl.setValue('');
    }
  }
}
