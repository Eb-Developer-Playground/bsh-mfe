import { Validators } from '@angular/forms';
import { ISearchOptions } from '@app/shared/models';
import { WhiteSpaceValidator } from '@app/shared/directives/whitespace-validator';

export class CustomValidator {
  static KENumberValidator(number: any): any {
    if (number.pristine) {
      return null;
    }
    const NUMBER_REGEXP = /^(?:254|\+254|0)?([0-9]{9})$/;
    number.markAsTouched();
    if (NUMBER_REGEXP.test(number.value)) {
      return null;
    }
    return {
      invalidNumber: true,
    };
  }

  static TZNumberValidator(number: any): any {
    if (number.pristine) {
      return null;
    }
    const NUMBER_REGEXP = /^(?:255|\+255|0)?([0-9]{9})$/;
    number.markAsTouched();
    if (NUMBER_REGEXP.test(number.value)) {
      return null;
    }
    return {
      invalidNumber: true,
    };
  }

  static DRCNumberValidator(number: any): any {
    if (number.pristine) {
      return null;
    }
    const NUMBER_REGEXP = /^(?:243|\+243)?([0-9]{9})$/;
    number.markAsTouched();
    if (NUMBER_REGEXP.test(number.value)) {
      return null;
    }
    return {
      invalidNumber: true,
    };
  }
}

export const SEARCH_OPTIONS: ISearchOptions[] = [
  {
    bank_id: '54', //ke
    options: [
      {
        name: 'COMMON.NATIONAL-ID',
        value: 'National ID',
        default: true,
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      }, //universal
      {
        name: 'COMMON.ACCOUNT-NUMBER',
        value: 'Account Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      }, //universal
      {
        name: 'COMMON.CIF',
        value: 'CIF',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      }, //universal
      {
        name: 'COMMON.MAISHA-CARD',
        value: 'Maisha Card',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      }, //ke
      {
        name: 'COMMON.MOBILENUMBER',
        value: 'Mobile Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          CustomValidator.KENumberValidator,
        ],
      }, //ke
      {
        name: 'COMMON.PASSPORT',
        value: 'Passport Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      }, //ke
      {
        name: 'COMMON.ALIEN-ID',
        value: 'Alien ID',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      }, //ke
      {
        name: 'COMMON.PERMIT-ID',
        value: 'Permit ID',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      }, //ke

      {
        name: 'COMMON.MILITARY-ID',
        value: 'Military ID',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      }, //ke
    ],
  },
  {
    bank_id: '55', //tz
    options: [
      {
        name: 'COMMON.NATIONAL-ID',
        value: 'National ID',
        default: true,
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(23),
          Validators.maxLength(23),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.ACCOUNT-NUMBER',
        value: 'Account Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.CIF',
        value: 'CIF',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.MOBILENUMBER',
        value: 'Mobile Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          CustomValidator.TZNumberValidator,
        ],
      },
      {
        name: 'COMMON.VOTERS-CARD',
        value: "Voter's Card",
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(17),
          Validators.maxLength(17),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
      {
        name: 'COMMON.PASSPORT',
        value: 'Passport Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
      // {
      //     name: "Zanzibari Resident Identity Card",
      //     validators: [
      //         Validators.required,
      //         WhiteSpaceValidator.containsOnlySpaces,
      //         Validators.minLength(9),
      //         Validators.maxLength(9),
      //         Validators.pattern("^[0-9]*$"),
      //     ],
      // },
    ],
  },
  {
    bank_id: '56', //ug
    options: [
      {
        name: 'COMMON.NATIONAL-ID',
        value: 'National ID',
        default: true,
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(14),
          Validators.maxLength(14),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
      {
        name: 'COMMON.ACCOUNT-NUMBER',
        value: 'Account Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      },
      {
        name: 'COMMON.CIF',
        value: 'CIF',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      },
    ],
  },
  {
    bank_id: '50', //rw
    options: [
      {
        name: 'COMMON.NATIONAL-ID',
        value: 'National ID',
        default: true,
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(16),
          Validators.maxLength(16),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.ACCOUNT-NUMBER',
        value: 'Account Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      },
      {
        name: 'COMMON.MOBILENUMBER',
        value: 'Mobile Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(10),
          Validators.maxLength(10),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.CIF',
        value: 'CIF',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      },
    ],
  },
  {
    bank_id: '43', //drc
    options: [
      {
        name: 'COMMON.ACCOUNT-NUMBER',
        value: 'Account Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(15),
          Validators.maxLength(15),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.CIF',
        value: 'CIF',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.PHONE-NUMBER',
        value: 'Phone Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          CustomValidator.DRCNumberValidator,
        ],
      },
      {
        name: 'COMMON.PASSPORT',
        value: 'Passport Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
      {
        name: 'COMMON.VOTERS-CARD',
        value: "Voter's Card",
        default: true,
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(17),
          Validators.maxLength(17),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
      {
        name: 'COMMON.MILITARY-ID',
        value: 'Military ID',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      },
      {
        name: 'COMMON.POLICE-ID',
        value: 'Police ID',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
        ],
      },
      {
        name: 'COMMON.REFUGEE-ID',
        value: 'Refugee ID',
        validators: [
          Validators.required,
          Validators.minLength(1),
          Validators.maxLength(29),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.DRIVERS-ID',
        value: 'Drivers ID',
        validators: [
          Validators.required,
          Validators.minLength(11),
          Validators.maxLength(29),
          Validators.pattern('^[a-zA-Z0-9]+$'),
        ],
      },
    ],
  },
  {
    bank_id: '11', //ss
    options: [
      {
        name: 'COMMON.NATIONAL-ID',
        value: 'National ID',
        default: true,
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(14),
          Validators.maxLength(14),
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
      {
        name: 'COMMON.ACCOUNT-NUMBER',
        value: 'Account Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(13),
          Validators.maxLength(13),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.CIF',
        value: 'CIF',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(11),
          Validators.maxLength(11),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.MOBILENUMBER',
        value: 'Mobile Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.minLength(12),
          Validators.maxLength(12),
          Validators.pattern('^[0-9]*$'),
        ],
      },
      {
        name: 'COMMON.PASSPORT',
        value: 'Passport Number',
        validators: [
          Validators.required,
          WhiteSpaceValidator.containsOnlySpaces,
          Validators.pattern('^[a-zA-Z0-9]*$'),
        ],
      },
    ],
  },
];
