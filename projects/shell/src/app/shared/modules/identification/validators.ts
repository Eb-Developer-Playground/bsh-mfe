import { Directive, forwardRef, Injectable, Input } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  UntypedFormControl,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import CONST from '@app/shared/utils/constants';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ISubsidiary } from '../../services/session/session.service';
import { IdTypeSpecs } from './data';
import { DedupeService } from './dedupe.service';
import { ID_TYPES } from './types';

const { COUNTRY_CODE } = CONST;

@Injectable({ providedIn: 'root' })
export class DedupeCheckValidator implements AsyncValidator {
  constructor(private dedupe: DedupeService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    return this.dedupe
      .performDedupe(
        control.get('idType')?.value,
        control.get('refNum')?.value,
        {
          headers: { skipLoadingInterceptor: 'true' },
        }
      )
      .pipe(
        map(resp => of(!resp.successful ? { dedupeFailed: true } : null)),
        catchError(() => of(null))
      );
  }
}

@Directive({
  selector: '[appDedupeValidator]',
  providers: [
    {
      provide: NG_ASYNC_VALIDATORS,
      useExisting: forwardRef(() => DedupeValidatorDirective),
      multi: true,
    },
  ],
})
export class DedupeValidatorDirective implements AsyncValidator {
  @Input() idType!: ID_TYPES;
  @Input() countryCode!: string;

  constructor(private dedupe: DedupeService) {}

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    const refNum = control.get('refNum')?.value;
    const firstName = control.get('firstName')?.value;
    const lastName = control.get('lastName')?.value;
    const phoneNumber = control.get('phoneNumber')?.value;
    const emailAddress = control.get('emailAddress')?.value;
    const birthDate = control.get('dob')?.value;
    const birthPlace = control.get('birthPlace')?.value;

    // Use either performDedupe or performDRCDedupe based on the flag
    const dedupeObservable =
      this.countryCode === COUNTRY_CODE.CD
        ? this.dedupe.performDRCDedupe(
            this.idType,
            refNum,
            firstName,
            lastName,
            birthDate,
            phoneNumber,
            birthPlace,
            emailAddress,
            { headers: { skipLoadingInterceptor: 'true' } }
          )
        : this.dedupe.performDedupe(this.idType, control.getRawValue(), {
            headers: { skipLoadingInterceptor: 'true' },
          });

    return dedupeObservable.pipe(
      map(resp => of(!resp.successful ? { dedupeFailed: true } : null)),
      catchError(() => of({ dedupeFailed: true }))
    );
  }
}

const ALPHA_NUMERIC_REGEX = /^[a-zA-Z0-9_]*$/;
const ALPHA_NUMERIC_VALIDATION_ERROR = {
  charactersError: 'Only alpha numeric values are allowed',
};

export function alphaNumericValidator(
  control: UntypedFormControl
): ValidationErrors | null {
  return ALPHA_NUMERIC_REGEX.test(control.value)
    ? null
    : ALPHA_NUMERIC_VALIDATION_ERROR;
}

export function validateNationalId(args?: {
  subsidiary?: ISubsidiary;
  idType?: any;
}): ValidatorFn {
  const idSpec = IdTypeSpecs.find(
    idt =>
      idt.idType === ID_TYPES.NationalId &&
      idt.countryCode === args?.subsidiary?.countryCode
  );
  const regex = <RegExp>idSpec?.pattern;
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val) return null;
    return !val.toString().match(regex) ? { invalidFormat: true } : null;
  };
}

export function validateDocumentNumber(args?: {
  subsidiary: ISubsidiary;
  idType: ID_TYPES;
}): ValidatorFn {
  const idSpec = IdTypeSpecs.find(
    idt =>
      idt.idType === args?.idType &&
      idt.countryCode === args?.subsidiary?.countryCode
  );
  const regex = <RegExp>idSpec?.pattern;
  return (control: AbstractControl): ValidationErrors | null => {
    const val = control.value;
    if (!val || !idSpec?.pattern) return null;
    return !val.toString().match(regex) ? { invalidFormat: true } : null;
  };
}
