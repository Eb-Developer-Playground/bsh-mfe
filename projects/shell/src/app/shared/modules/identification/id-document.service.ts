import { Injectable } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import {
  ID_TYPES,
  IdDocumentFieldStates,
  IdTypeDescription,
  IdTypeSpec,
  InquiryDocument,
} from './types';
import {
  ValidateLicense,
  ValidateMilitaryNumber,
  ValidateNationalId,
  ValidatePassport,
  ValidateRefugeeIDNumber,
  ValidateUNHCRProof,
} from '../../validators';
import { alphaNumericValidator, validateDocumentNumber } from './validators';
import { IdTypeSpecs } from './data/specs';
import { IdTypeDescriptions } from './data/descriptions';
import { DOC_REQUIREMENTS } from './data/requirements';
import { SessionService } from '@app/shared/services/session/session.service';

@Injectable({
  providedIn: 'root',
})
export class IdDocumentService {
  requirementsConfig = DOC_REQUIREMENTS;
  docSpecs: IdTypeSpec[] = IdTypeSpecs;
  allIdTypeDescriptions: IdTypeDescription[] = IdTypeDescriptions;
  allIdTypes: IdTypeDescription[] = [
    {
      name: 'National ID (Kenyan)',
      value: ID_TYPES.NationalId,
      isPrimary: true,
      dedupeParam: 'NATIONALID',
    },
    {
      name: 'Alien/Foreign ID',
      value: ID_TYPES.ForeignId,
      isPrimary: true,
      dedupeParam: 'ALIENID',
    },
    {
      name: 'Birth Certificate',
      value: ID_TYPES.BirthCertificate,
      isPrimary: false,
      dedupeParam: 'BIRTHCERTIFICATE',
    },
    {
      name: 'Passport (Kenyan)',
      value: ID_TYPES.KenyanPassport,
      isPrimary: false,
      dedupeParam: 'PASSPORTID',
    },
    {
      name: 'Passport (Foreign)',
      value: ID_TYPES.ForeignPassport,
      isPrimary: true,
      dedupeParam: 'PASSPORTID',
    },
    {
      name: 'Permit',
      value: ID_TYPES.WorkPermit,
      isPrimary: false,
      dedupeParam: 'PERMITID',
    },
    {
      name: 'Drivers License (Kenyan)',
      value: ID_TYPES.DriversLicense,
      isPrimary: false,
      dedupeParam: 'DRIVERSLICENSE',
    },
    {
      name: 'Military Personnel Service Card (Kenyan)',
      value: ID_TYPES.MilitaryServiceCard,
      isPrimary: false,
      dedupeParam: 'MILITARYID',
    },
    {
      name: 'Refugee ID',
      value: ID_TYPES.RefugeeId,
      isPrimary: true,
      dedupeParam: 'REFUGEEID',
    },
    {
      name: 'UNHCR Proof',
      value: ID_TYPES.UNHCRPROOF,
      isPrimary: false,
      dedupeParam: 'UNHCRID',
    },
  ];

  DOC_SPECS: IdTypeSpec[] = [
    {
      idType: ID_TYPES.NationalId,
      docCode: 'DOC03',
      docDescr: 'NATIONAL I.D',
      docTypeCode: 'INDIV',
      docTypeDesc: 'IDENTIFICATION PROOF FOR INDIVIDUALS',
      countryOfIssue: 'KE',
      maxLength: 8,
      minLength: 6,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
      hint: '123456 or 12345678',
    },
    {
      idType: ID_TYPES.MilitaryServiceCard,
      docCode: 'MILTID',
      docDescr: 'MILITARY ID',
      docTypeCode: 'INDIV',
      docTypeDesc: 'IDENTIFICATION PROOF FOR INDIVIDUALS',
      countryOfIssue: 'KE',
      maxLength: 5,
      minLength: 5,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
    },
    {
      idType: ID_TYPES.DriversLicense,
      docCode: 'DRVLC',
      docDescr: 'DRIVERS LICENSE (NRE)',
      docTypeCode: 'NONRE',
      docTypeDesc: 'IDENTIFICATION PROOF FOR NON RESIDENTS',
      countryOfIssue: 'KE',
      maxLength: 11,
      minLength: 6,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: /[A-Z]{2}-[0-9]{7}/g,
      hint: 'DL-0123456',
    },
    {
      idType: ID_TYPES.KenyanPassport,
      docCode: 'PSSPR',
      docDescr: 'PASSPORTS',
      docTypeCode: 'INDIV',
      docTypeDesc: 'IDENTIFICATION PROOF FOR INDIVIDUALS',
      countryOfIssue: 'KE',
      maxLength: 9,
      minLength: 5,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
      hint: 'AK1234567',
    },
    {
      idType: ID_TYPES.ForeignPassport,
      docCode: 'PSSPR',
      docDescr: 'PASSPORTS',
      docTypeCode: 'FOREN',
      docTypeDesc: 'IDENTIFICATION PROOF FOR FOREIGN INDIVIDUALS',
      maxLength: 15,
      minLength: 0,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
    },
    {
      idType: ID_TYPES.ForeignId,
      docCode: 'ALNID',
      docDescr: 'ALIEN CERTIFICATE',
      docTypeCode: 'FOREN',
      docTypeDesc: 'IDENTIFICATION PROOF FOR FOREIGN INDIVIDUALS',
      countryOfIssue: 'KE',
      maxLength: 8,
      minLength: 6,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
    },
    {
      idType: ID_TYPES.WorkPermit,
      docCode: 'PERMT',
      docDescr: 'WORK/BUSINESS PERMIT',
      docTypeCode: 'FOREN',
      docTypeDesc: 'IDENTIFICATION PROOF FOR FOREIGN INDIVIDUALS',
      countryOfIssue: 'KE',
      maxLength: 15,
      minLength: 0,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
    },
    {
      idType: ID_TYPES.RefugeeId,
      docCode: 'REFID',
      docDescr: 'REFUGEE CERTIFICATE (RC)',
      docTypeCode: 'REFUG',
      docTypeDesc: 'IDENTIFICATION PROOF FOR REFUGEES',
      countryOfIssue: 'KE',
      maxLength: 13,
      minLength: 22,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      pattern: null,
    },
    {
      idType: ID_TYPES.BirthCertificate,
      docCode: 'BIRCT',
      docDescr: 'BIRTH CERTIFICATE',
      docTypeCode: 'MINOR',
      docTypeDesc: 'IDENTIFICATION PROOF FOR MINORS',
      countryOfIssue: 'KE',
      maxLength: 12,
      minLength: 4,
      maxIssueDate: new Date(),
      minIssueDate: new Date(
        new Date().getFullYear() - 18,
        new Date().getMonth(),
        new Date().getDate() - 1
      ),
      pattern: /^[0-9/]+$/,
      hint: '01234567/09 or 012345678',
    },
    {
      idType: ID_TYPES.UNHCRPROOF,
      docCode: 'UNHCR',
      docDescr: 'UNHCR PROOF',
      docTypeCode: 'INDIV',
      docTypeDesc: 'IDENTIFICATION PROOF FOR INDIVIDUALS',
      countryOfIssue: 'KE',
      maxLength: 13,
      minLength: 12,
      pattern: /\d{3}-\d{8,9}/,
      maxIssueDate: new Date(),
      minIssueDate: new Date(new Date().getFullYear() - 100, 1, 1),
      hint: '123-123456789',
    },
  ];

  constructor(private session: SessionService) {}

  getIdTypes(
    nationality: string,
    countryOfResidence: string,
    dedupeIdType?: ID_TYPES,
    ageCategory: 'Adult' | 'Minor' = 'Adult'
  ): IdTypeDescription[] {
    const sub = this.session.subsidiary;
    this.docSpecs.filter(i => i.countryCode === sub.countryCode);
    if (
      nationality !== sub.countryCode &&
      countryOfResidence !== sub.countryCode
    ) {
      return [];
    }
    let reqIdTypes: IdTypeDescription[] = [];

    const requirements = this.requirementsConfig[sub.countryCode];
    const isMinor = ageCategory === 'Minor';
    const isResident =
      nationality === sub.countryCode && countryOfResidence === sub.countryCode;
    const isNonResident =
      nationality === sub.countryCode && countryOfResidence !== sub.countryCode;
    const isForeigner =
      nationality !== sub.countryCode &&
      dedupeIdType !== requirements.FOR_REF_ID;
    const isRefugee =
      nationality !== sub.countryCode &&
      dedupeIdType === requirements.FOR_REF_ID;
    let primaryTypes: ID_TYPES[] = [];
    let mandatoryTypes: ID_TYPES[] = [];
    let optionalTypes: ID_TYPES[] = [];
    if (isMinor) {
      primaryTypes = requirements.MINOR.primary;
      mandatoryTypes = requirements.MINOR.mandatory;
      optionalTypes = requirements.MINOR.optional;
    } else if (isRefugee) {
      primaryTypes = requirements.REFUGEE.primary;
      mandatoryTypes = requirements.REFUGEE.mandatory;
      optionalTypes = requirements.REFUGEE.optional;
    } else if (isForeigner) {
      primaryTypes = requirements.FOREIGNER.primary;
      mandatoryTypes = requirements.FOREIGNER.mandatory;
      optionalTypes = requirements.FOREIGNER.optional;
    } else if (isNonResident) {
      primaryTypes = requirements.NRE.primary;
      mandatoryTypes = requirements.NRE.mandatory;
      optionalTypes = requirements.NRE.optional;
    } else if (isResident) {
      primaryTypes = requirements.RE.primary;
      mandatoryTypes = requirements.RE.mandatory;
      optionalTypes = requirements.RE.optional;
    }
    // Post dedupe call
    if (dedupeIdType) primaryTypes = [<ID_TYPES>dedupeIdType];
    // Override for dedupe for foreigners & refugees
    if (!dedupeIdType && nationality !== sub.countryCode) {
      primaryTypes = [
        ...requirements.REFUGEE.primary,
        ...requirements.FOREIGNER.primary,
      ];
    }

    reqIdTypes = this.allIdTypeDescriptions.filter(i =>
      [...primaryTypes, ...mandatoryTypes, ...optionalTypes].includes(i.value)
    );

    reqIdTypes.forEach(i => {
      i.isPrimary = primaryTypes.includes(i.value);
      i.isMandatory = mandatoryTypes.includes(i.value);
    });
    return reqIdTypes.sort((a, _b) => (a?.isPrimary ? -1 : 1));
  }

  getPrimaryIdTypes(
    nationality: string,
    countryOfResidence: string,
    dedupeIdType?: ID_TYPES,
    ageCategory: 'Adult' | 'Minor' = 'Adult'
  ): IdTypeDescription[] {
    let mandatoryIdTypes: ID_TYPES[] = [];
    let primaryIdTypes: ID_TYPES[] = [];
    let idTypes: ID_TYPES[] = [];
    if (ageCategory === 'Adult') {
      if (nationality === 'KE') {
        idTypes = [ID_TYPES.NationalId, ID_TYPES.KenyanPassport];
        if (countryOfResidence === 'KE') {
          idTypes = [
            ...idTypes,
            ID_TYPES.MilitaryServiceCard,
            ID_TYPES.DriversLicense,
          ];
          mandatoryIdTypes = [ID_TYPES.NationalId];
        } else {
          mandatoryIdTypes = [ID_TYPES.NationalId, ID_TYPES.KenyanPassport];
        }
        primaryIdTypes = [ID_TYPES.NationalId];
      } else {
        if (countryOfResidence === 'KE') {
          primaryIdTypes = [ID_TYPES.ForeignId];
          const foreignIdTypes = [
            ID_TYPES.ForeignPassport,
            ID_TYPES.ForeignId,
            ID_TYPES.WorkPermit,
          ];
          const refugeeIdTypes = [ID_TYPES.RefugeeId, ID_TYPES.UNHCRPROOF];
          if (
            [
              ID_TYPES.ForeignId,
              ID_TYPES.ForeignPassport,
              ID_TYPES.RefugeeId,
            ].includes(<ID_TYPES>dedupeIdType)
          ) {
            // For foreigner ForeignID & ForeignPassport mandatory
            if (
              [ID_TYPES.ForeignId, ID_TYPES.ForeignPassport].includes(
                <ID_TYPES>dedupeIdType
              )
            ) {
              idTypes = foreignIdTypes;
              mandatoryIdTypes = [ID_TYPES.ForeignId, ID_TYPES.ForeignPassport];
            } else {
              // For refugee, Refugee ID and UNHCR PROOF mandatory
              idTypes = refugeeIdTypes;
              mandatoryIdTypes = [ID_TYPES.RefugeeId, ID_TYPES.UNHCRPROOF];
            }
            primaryIdTypes = [<ID_TYPES>dedupeIdType];
          } else {
            idTypes = [...foreignIdTypes, ...refugeeIdTypes];
            mandatoryIdTypes = [ID_TYPES.ForeignPassport];
            primaryIdTypes = [
              ID_TYPES.ForeignId,
              ID_TYPES.ForeignPassport,
              ID_TYPES.RefugeeId,
            ];
          }
        }
      }
    } else if (nationality === 'KE') {
      primaryIdTypes = [ID_TYPES.BirthCertificate];
      mandatoryIdTypes = [ID_TYPES.BirthCertificate];
      idTypes = [ID_TYPES.BirthCertificate, ID_TYPES.KenyanPassport];
    }
    const idTypeList: IdTypeDescription[] = this.allIdTypes.filter(d =>
      idTypes.includes(d.value)
    );
    idTypeList.forEach(d => {
      d.isMandatory = mandatoryIdTypes.includes(d.value);
    });
    idTypeList.forEach(d => {
      d.isPrimary = primaryIdTypes.includes(d.value);
    });
    return idTypeList.sort((a, b) => (a?.isPrimary ? -1 : 1));
  }

  setRefNumberValidations(
    idType: ID_TYPES,
    refNumControl?: AbstractControl | null
  ) {
    refNumControl?.clearValidators();
    refNumControl?.setValidators([
      Validators.required,
      validateDocumentNumber({
        subsidiary: this.session.subsidiary,
        idType: idType,
      }),
    ]);
    refNumControl?.updateValueAndValidity();
  }

  mapCifIdentificationDocs(docs: InquiryDocument[]): IdDocumentFieldStates[] {
    return docs
      .filter(d => d.referenceNum)
      .map(d => {
        return {
          idType: {
            value: this.DOC_SPECS.find(
              s => d.docType == s.docTypeCode && d.docCode == s.docCode
            )?.idType,
            readonly: true,
          },
          refNum: { value: d.referenceNum },
          docIssueDt: { value: new Date(d.issueDt) },
          countryOfIssue: { value: d.countryOfIssue },
          placeOfIssue: { value: d.placeOfIssue },
          preferredUniqueId: { value: d.preferredUniqueId },
          serialNumber: { value: null },
        };
      });
  }
}
