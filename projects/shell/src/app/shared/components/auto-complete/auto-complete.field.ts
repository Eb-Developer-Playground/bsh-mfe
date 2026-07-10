import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import {
  ControlContainer,
  FormGroup,
  ReactiveFormsModule,
  UntypedFormControl,
  Validators,
} from '@angular/forms';
import { BooleanInput, coerceBooleanProperty } from '@angular/cdk/coercion';
import {
  CdkFixedSizeVirtualScroll,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
} from '@angular/cdk/scrolling';
import {
  MatAutocomplete,
  MatAutocompleteModule,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectTrigger } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { Observable, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { SearchableItem } from '@app/shared/models/searchable';

@Component({
  selector: 'autocomplete-field',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CdkVirtualForOf,
    CdkFixedSizeVirtualScroll,
    CdkVirtualScrollViewport,
    MatAutocompleteModule,
    MatAutocompleteTrigger,
    MatFormFieldModule,
    MatInputModule,
    TranslateModule,
    MatSelectTrigger,
  ],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  templateUrl: './auto-complete.field.html',
  styleUrl: './auto-complete.field.scss',
})
export class AutoCompleteField implements OnInit {
  readonly destroyRef = inject(DestroyRef);
  @ViewChild('autocomplete') autoComplete!: MatAutocomplete;
  @Input() label: string = 'Search items';
  @Input() hint!: string;
  @Input() placeholder: string = '';
  @Input({ required: true }) controlKey!: string;
  @Input({ required: true }) dataSource: Observable<Array<SearchableItem>> = of(
    []
  );
  @Output() onSelected = new EventEmitter<{ option: { value: any } }>();
  _items: Array<SearchableItem> = [];
  filteredItems!: Observable<Array<SearchableItem>>;
  inputControl: UntypedFormControl = new UntypedFormControl();
  _parentContainer = inject(ControlContainer);

  @Input()
  get required(): boolean {
    return (
      this._required ||
      <boolean>(
        this.ParentFormGroup.get(this.controlKey)?.hasValidator(
          Validators.required
        )
      )
    );
  }

  set required(value: BooleanInput) {
    this._required = coerceBooleanProperty(value);
  }

  private _required = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
    if (this._disabled) this.inputControl.disable();
    else this.inputControl.enable();
  }

  private _disabled = false;

  get ParentFormGroup(): FormGroup {
    return this._parentContainer.control as FormGroup;
  }

  ngOnInit() {
    this.dataSource
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => {
        if (!Array.isArray(data)) return;
        this._items = data;
        this.inputControl.setValue(null);
        this.onSelectValue(
          data.find(
            i =>
              i.toInternal() ===
              this.ParentFormGroup.get(this.controlKey)?.value
          )
        );
        this.filteredItems = this.inputControl.valueChanges.pipe(
          takeUntilDestroyed(this.destroyRef),
          startWith(''),
          map(value => {
            return this._items?.filter(o =>
              o
                .toString()
                .toLowerCase()
                ?.includes(
                  value?.toString().toLowerCase() || value?.toLowerCase()
                )
            );
          })
        );
        const initial = this.ParentFormGroup.get(this.controlKey)?.value;
        if (initial) this.patchValue(initial);
      });
    this.ParentFormGroup?.get(this.controlKey)
      ?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(ch => this.patchValue(ch));
  }

  onSelectValue(v?: any) {
    if (!v) return;
    const matches = this._items.filter(
      c => `${c.toString()}`.toUpperCase() === `${v}`?.toUpperCase()
    );
    const hit = matches?.[0];
    if (hit) {
      this.inputControl.patchValue(hit.toString());
      this.ParentFormGroup.get(this.controlKey)?.patchValue(hit.toInternal(), {
        emitEvent: false,
      });
      this.onSelected.emit({ option: { value: hit.toInternal() } });
    } else {
      this.ParentFormGroup.get(this.controlKey)?.patchValue(null);
    }
    this.ParentFormGroup.get(this.controlKey)?.updateValueAndValidity();
  }

  patchValue(cc: any) {
    if (!cc) return;
    if (!cc || !this._items.length) return;
    const matches = this._items.filter(
      c => `${c.toInternal()}`.toUpperCase() === `${cc}`?.toUpperCase()
    );
    const obj = matches?.[0];
    if (obj) {
      this.inputControl.patchValue(obj.toString(), { emitEvent: false });
      this.ParentFormGroup.get(this.controlKey)?.patchValue(obj.toInternal(), {
        emitEvent: false,
      });
      this.onSelected.emit({ option: { value: obj.toInternal() } });
    } else {
      if (this._items.length > 0) {
        this.inputControl.patchValue(null);
        this.ParentFormGroup.get(this.controlKey)?.patchValue(null);
      }
    }
    this.ParentFormGroup.get(this.controlKey)?.updateValueAndValidity({
      emitEvent: false,
    });
  }
}
