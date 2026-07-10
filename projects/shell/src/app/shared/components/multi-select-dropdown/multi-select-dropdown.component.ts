import { CommonModule } from '@angular/common';
import { Component, computed, forwardRef, input, output, signal, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { COMPAT_IMPORTS } from '../../compat-barrel';

export interface SelectableOption {
  code: string;
  description: string;
  selected?: boolean;
}

@Component({
  selector: 'app-multi-select-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule
  ],
  template: `
    <div class="multi-select-dropdown">
      <!-- Dropdown selector -->
      <mat-form-field [appearance]="appearance()" class="w-100">
        <mat-label>{{ label() }}</mat-label>
        <mat-select
          [multiple]="multiple()"
          [value]="selectedValues"
          (selectionChange)="onSelectionChange($event)"
          [class]="selectClass()">

          <!-- Search option at the top -->
          @if (showSearch()) {
            <div class="search-option" (click)="$event.stopPropagation()">
              <div class="search-container d-flex align-items-center" (click)="$event.stopPropagation()">
                <input
                  [ngModel]="searchTerm()"
                  (ngModelChange)="onSearchChange($event)"
                  (click)="$event.stopPropagation()"
                  [placeholder]="searchPlaceholder()"
                  class="search-input">
                <mat-icon class="search-icon">{{ searchIcon() }}</mat-icon>
              </div>
            </div>
          }

          <!-- Options -->
          @for (option of filteredOptions(); track option.code) {
            <mat-option [value]="option.code" [class]="optionClass()">
              <div class="d-flex align-items-center justify-content-between w-100">
                <span>{{ option.description }}</span>
              </div>
            </mat-option>
          }

          @if (filteredOptions().length === 0 && searchTerm() && showSearch()) {
            <mat-option disabled class="no-results">
              <span class="color-grey">{{ noResultsText() }}</span>
            </mat-option>
          }
        </mat-select>

        <!-- Show selected count -->
        @if (showSelectedCount()) {
          <mat-hint class="d-flex justify-content-between">
            <span>{{ selectedCount }}</span>
          </mat-hint>
        }
      </mat-form-field>
    </div>
  `,
  styleUrls: ['./multi-select-dropdown.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultiSelectDropdownComponent),
      multi: true
    }
  ]
})
export class MultiSelectDropdownComponent implements ControlValueAccessor {
  // Basic configuration
  label = input<string>('Select options');
  options = input<SelectableOption[]>([]);
  multiple = input<boolean>(true);
  appearance = input<'fill' | 'outline'>('fill');

  // Search configuration
  showSearch = input<boolean>(true);
  searchPlaceholder = input<string>('Search...');
  searchIcon = input<string>('search');
  noResultsText = input<string>('No results found');

  // Display configuration
  showSelectedCount = input<boolean>(true);
  selectedCountTemplate = input<string>('{{count}} selected');
  selectClass = input<string>('multi-select');
  optionClass = input<string>('select-option');

  // Events
  selectionChange = output<SelectableOption[]>();

  searchTerm = signal<string>('');

  filteredOptions = computed(() => {
    const opts = this.options();
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) {
      return opts;
    }
    return opts.filter(
      option =>
        option.description.toLowerCase().includes(term) ||
        option.code.toLowerCase().includes(term),
    );
  });

  selectedValues: string[] = [];

  private onChange = (value: string[]) => {};
  private onTouched = () => {};

  get selectedCount(): string {
    const count = this.selectedValues.length;
    return this.selectedCountTemplate().replace('{{count}}', count.toString());
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
  }

  onSelectionChange(event: any) {
    // This handles the mat-select selection change
    this.selectedValues = event.value || [];
    this.updateSelections();
    this.onChange(this.selectedValues);
    this.onTouched();
    this.emitSelectionChange();
  }

  toggleOption(code: string, checked: boolean) {
    if (checked && !this.selectedValues.includes(code)) {
      this.selectedValues.push(code);
    } else if (!checked && this.selectedValues.includes(code)) {
      this.selectedValues = this.selectedValues.filter(val => val !== code);
    }
    this.updateSelections();
    this.onChange(this.selectedValues);
    this.onTouched();
    this.emitSelectionChange();
  }

  isSelected(code: string): boolean {
    return this.selectedValues.includes(code);
  }

  private updateSelections() {
    this.options().forEach(option => {
      option.selected = this.selectedValues.includes(option.code);
    });
  }

  private emitSelectionChange() {
    const selectedOptions = this.options().filter(opt => opt.selected);
    this.selectionChange.emit(selectedOptions);
  }  // ControlValueAccessor implementation
  writeValue(value: string[]): void {
    if (value && Array.isArray(value)) {
      this.selectedValues = [...value];
      this.updateSelections();
    }
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Handle disabled state if needed
  }
}
