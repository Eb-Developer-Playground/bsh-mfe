# Usage

1. Import AutoCompleteField

    `import {AutoCompleteField} from "@shared/components/auto-complete";`

2. Initialize an observable array whose entries implement _SearchableItem_.

template

```html
<form
    [ngForm]="form">
    ...
    <autocomplete-field
        [label]="'FORMS.CONTACT_DETAILS.LABELS.COUNTRY'"
        [controlKey]="'country'"
        [dataSource]="countries$.asObservable()">
        @if(form.get('country')?.hasError('required'))
        {
        {{
        'FORMS.CONTACT_DETAILS.LABELS.COUNTRY'|translate
        }}
        {{
        'COMMON.IS_REQUIRED'|translate
        }}
        }
    </autocomplete-field>
</form>
```

component ts

```ts
export class EmployerDetailsComponent {
    ...
    countries$: BehaviorSubject<Country[]> = new BehaviorSubject<Country[]>([]);
```

3. Add `<autocomplete-field></autocomplete-field>` to your template and bind the mandatory inputs i.e. `controlKey` and `dataSource`. Optionally pass `label` if you want to customize the field label.
4. To handle selection events, handle the `onSelected` event emitter.

template

```html
<autocomplete-field
    ...
    (onSelected)="onCountrySelected($event)"
    ...
</autocomplete-field>
```

component ts

```ts
    onCountrySelected(value: string) {
        // Do something
    }
```

5. Update the dropdown options is as easy as pushing new array into the observable stream. The field state updates accordingly to reflect this change.

```ts

    ...
    updateOptions<T extends SearchableItem>(newList: T[]) {
        this.countries$.next([...newList]);
    }

    ...
```
