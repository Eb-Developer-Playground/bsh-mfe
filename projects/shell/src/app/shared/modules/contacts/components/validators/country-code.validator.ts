import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { exhaustMap, map } from 'rxjs/operators';
import { StaticDataService } from '@app/shared/services/static-data.service';

export class CountryCodeValidator {
  static createValidator(service: StaticDataService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const debounceTime = 1000; // milliseconds
      return timer(debounceTime).pipe(
        exhaustMap(() => {
          if (control && control.value) {
            return service
              .getCountriesInfo()
              .pipe(map(data => data.find(c => c.dialCode === control.value)));
          } else {
            return of(null);
          }
        }),
        // tap((x) => console.log(x)),
        map(ci => {
          if (control.value && !!ci) return { invalidCountry: true };
          return null;
        })
      );
    };
  }
}
