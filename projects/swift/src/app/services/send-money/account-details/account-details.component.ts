import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, Observable } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { AsyncPipe, CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { StepperEventName } from '../models/step.model';
import { StepperService } from '../service/stepper.service';

export interface Country {
  flag: string;
  name: string;
}

export function validateKraPin(control: AbstractControl): { [key: string]: any } | null {
  let val = control.value;
  if (val === null || val === '') return null;
  if (!val.toString().match(/\b[A-Z]{1}[0-9]{9}[A-Z]{1}\b/g)) return { invalidKraPin: true };
  return null;
}

export function validateEmail(control: AbstractControl): { [key: string]: any } | null {
  let emailRegEx =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
  let valid = emailRegEx.test(control.value);
  return control.value < 1 || valid ? null : { invalidEmail: true };
}

export function validateEmailComment(control: AbstractControl): ValidationErrors | null {
  const email = control.get('email_address')?.value;
  const comment = control.get('email_comment')?.value?.trim();
  if (!email && !comment) return { notValid: true };
  return null;
}

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrl: './account-details.component.scss',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    AsyncPipe,
    TranslatePipe,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTooltipModule,
    MatRadioModule,
    MatDialogModule,
  ],
})
export class AccountDetailsComponent implements OnInit, OnDestroy {
  private formBuilder = inject(FormBuilder);
  readonly dialog = inject(MatDialog);
  private router = inject(Router);
  private stepperService = inject(StepperService);

  private toast: any = null;
  private toastService: any = null;

  success = 'SUCCESS';
  title = 'Biometrics scanned successfully';
  text = 'The customer\'s biometric information was scanned and saved successfully';
  data: any = [
    { documentName: 'National ID.pdf', fileSize: '1.2 Mb' },
    { documentName: 'KRA PIN Certificate.pdf', fileSize: '1.2 Mb' },
    { documentName: 'Passport.pdf', fileSize: '1.2 Mb' },
    { documentName: 'EDD form.pdf', fileSize: '1.2 Mb' },
    { documentName: 'Customer signature.pdf', fileSize: '1.2 Mb' },
    { documentName: 'Other document.pdf', fileSize: '1.2 Mb' },
  ];

  destroyFlag: Subject<any> = new Subject<any>();
  schemeCodes: any = { data: [] };
  accountTypes: any[] = [];
  schemeTypes: any[] = [];
  countySelection$: Subject<any> = new Subject<any>();
  contactFormGroups: FormGroup[] = [];
  additionalContactsValid: boolean = false;
  groupForm: FormGroup = this.formBuilder.group({
    nationalityForm: this.formBuilder.group({
      nationality: [null, Validators.required],
      residence: [null, Validators.required],
      id_type: [null, Validators.required],
      id_serial: [null, Validators.required],
    }),
    detailsForm: this.formBuilder.group({
      first_name: [null, [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      middle_name: [null, [Validators.pattern('[A-Za-z ]+')]],
      surname: [null, [Validators.required, Validators.pattern('[A-Za-z ]+')]],
      dob: [null, Validators.required],
      kra_pin: [null, [Validators.required, validateKraPin]],
      gender: [null, Validators.required],
      marital_status: [null, Validators.required],
    }),
    contactForm: this.formBuilder.group(
      {
        email_address: [null, [validateEmail]],
        enable_email: [null],
        mobile_number: [null, [Validators.required, Validators.pattern('[0-9+]*'), Validators.minLength(9), Validators.maxLength(9)]],
        enable_phone: [null],
        email_verified: [null],
        mobile_verified: [null, Validators.required],
        contacts: [null, Validators.required],
        email_comment: [null, Validators.minLength(3)],
      },
      { validators: validateEmailComment }
    ),
    additionalForm: this.formBuilder.group({
      joint_account: [null],
      minor: [null],
      high_risk: [null],
      staff: [null],
    }),
    accountForm: this.formBuilder.group({
      type: [null, Validators.required],
      currency: [null, Validators.required],
      scheme_type: [null, Validators.required],
      dispatch_mode: [null, Validators.required],
      statement_frequency: [null, Validators.required],
      date_from: [null, Validators.required],
    }),
  });

  today: Date = new Date();
  counter: number = 1;
  submittingNationality: boolean = false;
  isVerified: boolean = false;
  countries: Country[] = [
    { name: 'Kenya', flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg' },
    { name: 'Another Country', flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg' },
    { name: 'Another Country', flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg' },
    { name: 'Another Country', flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg' },
  ];
  filteredCountries!: Observable<Country[]>;
  id_type: any;
  nationalityFormValues: any;

  constructor() {
    try {
      const ToastService = (window as any).__ngContext__?.ToastService;
      if (ToastService) this.toast = ToastService;
    } catch {}

    this.stepperService.stepperEvent$.pipe(takeUntil(this.destroyFlag)).subscribe(ev => {
      if (ev.event === StepperEventName.SAVE && ev.step?.label === 'Customer Profile') {
        // TODO: Post to backend when service is available
      }
    });

    this.countySelection$.subscribe(val => {
      this.schemeTypes = this.schemeCodes.data.filter((v: { AccountType: any }) => v.AccountType === val);
    });

    this.filteredCountries = this.groupForm.get('nationalityForm.residence')!.valueChanges.pipe(
      startWith(''),
      map(Country => (Country ? this._filterCountries(Country) : this.countries.slice()))
    );

    this.groupForm.valueChanges.subscribe(val => {
      if (this.counter === 1 && this.nationalityForm.valid) {
        this.counterIncrement();
        this.isVerified = true;
      } else if (this.counter > 1 && this.nationalityForm.invalid) {
        this.counter = 1;
        this.isVerified = false;
      }
      if (this.counter === 2 && this.detailsForm.valid) {
        this.counterIncrement();
      } else if (this.counter > 2 && this.detailsForm.invalid) {
        this.counter = 2;
      }
      if (this.counter === 3 && this.contactForm.valid) {
        this.counterIncrement();
      } else if (this.counter > 3 && this.contactForm.invalid) {
        this.counter = 3;
      }
      if (this.counter === 4 && this.additionalForm.valid) {
        this.counterIncrement();
      } else if (this.counter > 4 && this.additionalForm.invalid) {
        this.counter = 4;
      }
      if (this.counter === 5 && this.accountForm.valid) {
        this.counterIncrement();
      } else if (this.counter > 5 && this.accountForm.invalid) {
        this.counter = 5;
      }
    });
  }

  get nationalityForm() { return this.groupForm.get('nationalityForm') as FormGroup; }
  get detailsForm() { return this.groupForm.get('detailsForm') as FormGroup; }
  get contactForm() { return this.groupForm.get('contactForm') as FormGroup; }
  get additionalForm() { return this.groupForm.get('additionalForm') as FormGroup; }
  get accountForm() { return this.groupForm.get('accountForm') as FormGroup; }
  get contactFormValidity() { return this.groupForm.get('contactForm')?.valid as boolean; }

  ngOnInit(): void {
    this.getAccountTypes();
  }

  ngOnDestroy(): void {
    this.destroyFlag.next('');
    this.destroyFlag.complete();
  }

  getNationalityData(): void {
    try {
      this.id_type = JSON.parse(localStorage.getItem('dedupeDetails') || '{}');
      if (this.id_type && Object.keys(this.id_type).length !== 0) {
        this.nationalityForm.controls['residence'].patchValue(this.id_type.countryOfResidence);
        this.nationalityForm.controls['id_type'].patchValue(this.id_type.idType);
        this.nationalityForm.controls['nationality'].patchValue(this.id_type.nationality);
        this.nationalityForm.controls['id_serial'].patchValue('DUMMY');
        const possibleKeys = ['NationalID', 'KenyanPassport', 'DriversLicense', 'MilitaryServiceCard', 'ForeignPassport', 'RefugeeID'];
        for (const key of possibleKeys) {
          if (this.id_type[key]) { this.nationalityFormValues = this.id_type[key]; break; }
        }
      } else {
        this.router.navigateByUrl('/home/account-opening/ke/individual/search');
      }
    } catch (e) {
      console.warn('getNationalityData: localStorage data not available', e);
    }
  }

  getAccountTypes(): void {
    this.accountTypes = this.schemeCodes.data
      .filter((v: any, i: any, a: any) => a.findIndex((t: { AccountType: any }) => t.AccountType === v.AccountType) === i)
      .map((v: { AccountType: string; SchemeCode: any; SchemeDesc: any; SchemeType: string }) => v);
  }

  _filterCountries(value: string): Country[] {
    const filterValue = value.toLowerCase();
    return this.countries.filter(c => c.name.toLowerCase().includes(filterValue));
  }

  counterIncrement(): void { this.counter++; }
  counterDecrement(): void { this.counter--; }

  createFields(): void {
    const itemToAdd = this.formBuilder.group({
      email_address: [null, validateEmail],
      enable_email: [null],
      mobile_number: [null, [Validators.pattern('[0-9+]*'), Validators.minLength(9)]],
      enable_phone: [null],
      email_verified: [null],
      mobile_verified: [null],
      groupIndex: [null],
    });
    itemToAdd.valueChanges.subscribe(v =>
      this.contactForm.controls['contacts'].patchValue(
        this.contactFormGroups.map(cf => cf.valid).every(i => i === true) ? 'valid' : null
      )
    );
    this.contactFormGroups.push(itemToAdd);
  }

  removeField(ind: any): void {
    this.contactFormGroups.splice(ind, 1);
  }

  getPriEmail() {
    const val = this.contactForm.controls['email_address'].value;
    return val && val !== null && val.trim() !== '' ? false : true;
  }

  disableState(item: FormGroup, control_name: 'email_address' | 'mobile_number') {
    const control = item.get(control_name);
    if (control) return (control.invalid && control.value) || !control.value;
    return true;
  }

  verifyContact(form: FormGroup, ind?: any, type?: 'email' | 'mobile'): void {
    const target = <HTMLInputElement>document.getElementById(`${type}-container${ind}`);
    const helpText = <HTMLInputElement>document.getElementById(`verify-help-${type}${ind}`);
    const inputValues: any[] = [];
    let control: HTMLInputElement;
    if (type === 'mobile') {
      control = <HTMLInputElement>document.getElementById(`mobile_number${ind}`);
    } else {
      control = <HTMLInputElement>document.getElementById(`email_address${ind}`);
    }
    if (target && target.children) {
      Array.from(target.children).forEach(element => {
        let inputValue = (<HTMLInputElement>element).value;
        if (inputValue !== '') inputValues.push(inputValue);
      });
    }
    if (inputValues.length !== 6) {
      target.classList.remove('is-verified');
      target.classList.add('is-error');
      helpText.classList.remove('hidden');
      helpText.classList.add('visible');
      return;
    } else {
      const verificationCode = inputValues.join();
      form.get(`${type}_verified`)?.patchValue(true);
      target.classList.remove('is-error');
      target.classList.add('is-verified');
      helpText.classList.add('hidden');
      helpText.classList.remove('visible');
      Array.from(target.children).forEach(element => {
        (<HTMLInputElement>element).setAttribute('readonly', 'readonly');
      });
      (<HTMLInputElement>control).setAttribute('readonly', 'readonly');
    }
    this.additionalContactsValid = this.contactFormGroups.map(cf => cf.valid).every(i => i === true);
    if (this.additionalContactsValid) {
      this.contactForm.controls['contacts'].patchValue(true);
    }
  }

  inputChanged($event: any): void {
    let target = $event.srcElement;
    let maxLength = parseInt(target.attributes['maxlength'].value, 10);
    let myLength = target.value.length;
    if (myLength >= maxLength) {
      let next = target;
      while ((next = next.nextElementSibling)) {
        if (next == null) break;
        if (next.tagName.toLowerCase() === 'input') {
          next.focus();
          break;
        }
      }
    }
  }

  weekendsDatesFilter = (d: Date | null): boolean => {
    d = new Date(d ? d : '');
    const day = d?.getDay();
    return day !== 0 && day !== 6;
  };
}
