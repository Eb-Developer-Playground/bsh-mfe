# About Searchable Form Control

Standalone form control that enables makes it easy to integrate typeahead, search autocomplete feature in an angular form.

## Getting started

1. Define how the control should render `display` and `form value` by creating a class model that implements SearchableItem. Return value of `toString()` would be used as display value while `toInternal()` would be the form value.
2. Initialize your `data source` as an observable.
3. Add `SearchableFormControl` from `/src/shared/form-controls/` to your imports.
4. Add `<searchable-control></searchable-control>` to your component template and pass `dataSource`, `label` e.t.c. You can also bind to a Reactive Form with `formControlName`.

Example: Adding a searchable `Country of residence` form input.

### test.module.ts

```
import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";
import {SearchableFormControl} from "../../shared/form-controls";
...


@NgModule({
    declarations: [
        TestComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SearchableFormControl
    ]
})
export class TestModule {

    constructor() {
    }
}
```

### test.component.ts

```
import {Component, OnInit} from '@angular/core';
import {UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";
import {SearchableItem} from "../../shared/form-controls";
import {ApiService} from "../../shared/services";


class Country implements SearchableItem {
    countryCode: string;
    countryName: string;

    constructor(data?: any) {
        this.countryCode = data?.countryCode;
        this.countryName = data?.countryName;
    }

    toInternal(): string {
        return this.countryCode;
    }

    toString(): string {
        return this.countryName;
    }
}

@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
    form!: UntypedFormGroup;
    countriesData$: Observable<Country[]>;

    constructor(private _fb: UntypedFormBuilder,
                private api: ApiService) {

        this.countriesData$ = this.api.get<Array<Country>>('/v1/datalookup/countries').pipe(
            map(d => of(d.map((i: any) => new Country(i))))
        )

    }

    ngOnInit() {
        this.form = this._fb.group({
            country: null
        });
        this.form.valueChanges.subscribe(console.log);
    }

    ...
}
```

### test.component.html

```
<div [formGroup]="form" class="fieldset">
    <searchable-control
        formControlName="country"
        [label]="'Country of residence'"
        [dataSource]="countriesData$"
        required>
    </searchable-control>
</div>
```

### NOTE:

SearchableFormControl by default validates the search string supplied. Incorrect values would result in an `Invalid {lable}` error. It also handles `Validators.required` error if the field is required.

### Want to update your dropdown options dynamically?

Try the following implementation.

```
@Component({
    selector: 'app-test',
    templateUrl: './test.component.html',
    styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
    dataSource$: BehaviorSubject<Country[]> = new BehaviorSubject<Country[]>([]);

    ...

    // call to update search control dropdown options
    updateOptions(newList: Country[]): void {
        this.dataSource$.next(newList);
    }
}
```
