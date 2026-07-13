import { Pipe, PipeTransform } from '@angular/core';
import * as constants from './constants';

@Pipe({
  name: 'filenameLabel',
  standalone: true,
})
export class FilenameLabelPipe implements PipeTransform {
  transform(filenameLabel: string): string {
    switch (filenameLabel) {
      case constants.FORM_DOCUMENT_NAME:
        return 'Account Opening Form';
      case constants.WORK_PERMIT_DOCUMENT_NAME:
        return 'Permit';
      case constants.FOREIGN_PASSPORT_DOCUMENT_NAME:
        return 'Foreign Passport';
      case constants.PASSPORT_SCREENING_RESULTS_DOCUMENT_NAME:
        return 'Passport Screening Results';
      case constants.INTRODUCTION_LETTER_DOCUMENT_NAME:
        return 'Introduction Letter';
      case constants.ALIEN_ID_DOCUMENT_NAME:
        return 'Alien ID';
      case constants.KRA_PIN_CERTIFICATE_DOCUMENT_NAME:
        return 'KRA Pin Certificate';
      case constants.FATCA_DOCUMENT_NAME:
        return 'FATCA Form';
      case constants.REFUGEE_ID_CARD_DOCUMENT_NAME:
        return 'Refugee ID Card';
      case constants.JOINT_ACCOUNT_LETTER_DOCUMENT_NAME:
        return 'Joint Account Letter';
      case constants.ACCOUNT_OPENING_FORM_DOCUMENT_NAME:
        return 'Account Opening Form';
      case constants.KENYAN_PASSPORT_DOCUMENT_NAME:
        return 'Kenyan Passport';
      case constants.NATIONAL_ID_DOCUMENT_NAME:
        return 'National ID';
      case constants.PROOF_OF_RESIDENCE:
        return 'Proof of Residence';
      case constants.UNHCR_PROOF:
        return 'UNHCR Proof';
      default:
        return filenameLabel;
    }
  }
}
