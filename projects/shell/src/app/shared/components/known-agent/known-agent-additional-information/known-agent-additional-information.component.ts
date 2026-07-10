import { Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
} from '@angular/forms';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AgentFormObj, FormNames } from '@app/shared/models';
import { ContactDetails } from '@app/shared/models/common/cifinquiry.model';
import { ICountryCode } from '@app/shared/modules/localization/models';
import { ToastService } from '@app/shared/modules/toast';
import { environment } from '@env/environment';

@Component({
  selector: 'app-known-agent-additional-information',
  templateUrl: './known-agent-additional-information.component.html',
  styleUrls: ['./known-agent-additional-information.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class KnownAgentAdditionalInformationComponent
  implements OnInit, OnDestroy, OnChanges
{
  @Input() contactDetails!: ContactDetails;
  @Output() isInformationFormValid: EventEmitter<any> = new EventEmitter();

  informationForm!: UntypedFormGroup;
  items!: UntypedFormArray;
  countryCodeArr: any[] = [];
  countryCodeSelected: any[] = [] /*ICountryCode*/;
  codesInputs = Array.from({ length: 6 }, (_, i) => `code${i + 1}`);
  textVerifyMobile = 'VERIFY-MOBILE-NUMBER';
  setFormReadOnly = false;
  private codeSent = false;
  private destroySubject$ = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private toastService: ToastService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.informationForm = this.fb.group({
      items: this.fb.array([]),
    });

    this.addItem();

    this.informationForm.statusChanges
      .pipe(takeUntil(this.destroySubject$))
      .subscribe(status => {
        const formObj: AgentFormObj = {
          formName: FormNames.ADDITIONALINFORMATION,
          values: this.informationForm.value,
          valid: true, //status === 'VALID'  && this.validatorNotTheSameValue(this.items)
        };
        this.isInformationFormValid.next(formObj);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.contactDetails) {
      //TESTING ONLY//
      const isDevEnv =
        environment.apiUrl === 'https://api-uat.equitygroupholdings.com' ||
        environment.apiUrl === 'https://api-dev.equitygroupholdings.com' ||
        environment.apiUrl === 'http:localhost:4200';
      //TESTING ONLY//
      if (!isDevEnv) {
        // if **The details stated should be displayed and no option to enter details manually**
        this.setFormReadOnly = true;
      }
      this.fillInfoFromContactDetails();
    }
  }

  addItem(): void {
    this.items = this.informationForm.get('items') as UntypedFormArray;
    this.items.push(this.createItem());
    this.setCountryCode(this.items.length - 1);
  }

  removeItem(item: number) {
    this.items.removeAt(item);
  }

  private createItem(): UntypedFormGroup {
    //  this.codesInputs.forEach(code=> {
    //   console. log(code)
    //    this.informationForm.addControl(code, this.fb.control('', [Validators.required, Validators.maxLength(1)]));
    //  });

    return this.fb.group({
      code: new UntypedFormControl({ value: '', disabled: true }, []), //Validators.required
      mobileNumber: new UntypedFormControl({ value: '', disabled: true }, []), //Validators.required, Validators.pattern('[0-9]*$'), Validators.minLength(8)
      email: new UntypedFormControl({ value: '', disabled: true }, []), //Validators.required, Validators.email
    });
  }

  verifyEmailNumber() {
    //TODO
  }

  verifyMobileNumber() {
    this.codeSent = true;
    this.textVerifyMobile = this.codeSent
      ? 'RESEND-EMAIL-LINK'
      : 'VERIFY-MOBILE-NUMBER';
  }

  private fillInfoFromContactDetails() {
    const detailsArray = ['primary'];
    // uncoment if you want to get a customer's secondary contact information
    /*-if (this.contactDetails.emailAddresses.length >= 2 ||  this.contactDetails.phoneNumbers.length   >= 2) {
              detailsArray.push('secondary');
            }*/

    let preferred = true;
    detailsArray.forEach((item, index) => {
      // autopopulating contact info //
      if (index === 1) {
        // adding secondary contact info //
        this.addItem();
        preferred = false;
      }

      const _control = this.items.controls[index];
      if (_control) {
        const controlEmail = _control.get('email');
        const controlCode = _control.get('code');
        const controlMobileNumber = _control.get('mobileNumber');

        if (controlEmail) {
          const email = this.contactDetails.emailAddresses.find(
            email => email.preferred === preferred
          );
          controlEmail.setValue(email?.emailAddress);
        }

        if (controlCode) {
          const code = this.contactDetails.phoneNumbers.find(
            code => code.preferred === preferred
          );
          controlCode.setValue(`+${code?.countryCode}`);
          // if (code) {
          //   const codeObject = this.countryCodeArr.find(item => item.dialCode === code.countryCode)
          //   controlCode.setValue(codeObject);
          // }

          //set selected value mat-select "code"
          this.countryCodeSelected[index] = code?.countryCode;
        }

        if (controlMobileNumber) {
          const phone = this.contactDetails.phoneNumbers.find(
            phone => phone.preferred === preferred
          );
          controlMobileNumber.setValue(`${phone?.cityCode}${phone?.number}`);
        }
      }
    });
  }

  getIcon(countryCode: ICountryCode): string {
    return countryCode && countryCode && countryCode.icon
      ? countryCode.icon
      : 'ic-flag-ke';
  }

  private setCountryCode(index = 0) {
    const countryInfo = localStorage.getItem('countryInfo');
    if (countryInfo) {
      this.countryCodeArr[index] = JSON.parse(countryInfo);

      this.countryCodeArr[index].forEach((country: any) => {
        switch (country.countryCode) {
          case 'KE':
            country.icon = 'ic-flag-ke';
            break;
          case 'TZ':
            country.icon = 'ic-flag-tz';
            break;
          case 'SS':
            country.icon = 'ic-flag-s-sudan';
            break;
          case 'RW':
            country.icon = 'ic-flag-rw';
            break;
          case 'UG':
            country.icon = 'ic-flag-ug';
            break;
          case 'CD':
            country.icon = 'ic-flag-drc';
            break;
          default:
            country.icon = 'ic-flag-ke';
            break;
        }
      });
    }
  }

  // private validatorNotTheSameValue(formArray: UntypedFormArray): boolean {
  //   const findDuplicates = (arr: string[]) =>
  //     arr.filter((item, index) => arr.indexOf(item) != index);
  //
  //   const _arrPhone: string[] = formArray.controls.map((control: any) => {
  //     // control.get('code').setErrors(null);
  //     // control.get('mobileNumber').setErrors(null);
  //     return (
  //       control.value.code.replace(/[^0-9]/g, '') + control.value.mobileNumber
  //     );
  //   });
  //
  //   const _arrEmail: string[] = formArray.controls.map((control: any) => {
  //     //control.get('email').setErrors({'duplicate': false});
  //     return control.value.email;
  //   });
  //
  //   const _findDuplicatesPhone = findDuplicates(_arrPhone);
  //   const _findDuplicatesEmail = findDuplicates(_arrEmail);
  //
  //   if (
  //     _findDuplicatesPhone.length !== 0 ||
  //     _findDuplicatesEmail.length !== 0
  //   ) {
  //     this.toastService.show(
  //       'Message',
  //       `${this.translate.instant('TOAST.CONTACT-INFO-DUPLICATE')}`,
  //       MessageBoxType.INFO
  //     );
  //   }
  //   return _findDuplicatesPhone.length !== 0 ||
  //     _findDuplicatesEmail.length !== 0
  //     ? false
  //     : true;
  // }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}
