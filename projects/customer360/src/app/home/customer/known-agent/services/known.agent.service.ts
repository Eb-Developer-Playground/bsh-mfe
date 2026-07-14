import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IKnownAgent } from '../models/known-agent.models';
import { CifInquiryObject } from '@app/shared/models/common/cifinquiry.model';
import { TransformPhoneNumberPipe } from '@app/shared/pipes/transform-phone-number.pipe';
import { TransformEmailPipe } from '@app/shared/pipes/transform-email.pipe';
import { MaritalStatusPipe } from '@app/shared/pipes/marital-status.pipe';
import { GenderPipe } from '@app/shared/pipes/gender.pipe';
import { SessionService } from '@app/shared/services';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { StaticDataService } from '@app/shared/services/static-data.service';

@Injectable({
  providedIn: 'root',
})
export class KnownAgentService {
  private selectedAgentSubject = new BehaviorSubject<IKnownAgent | null>(null);
  selectedAgentSubject$ = this.selectedAgentSubject.asObservable();

  private countries: any[] = [];
  private nationalities: any[] = [];
  private regions: any[] = [];
  private placesOfBirth: { code: string, name: string }[] = [];

  constructor(
    private sessionService: SessionService,
    private staticDataService: StaticDataService
  ) {
    this.loadReferenceData();
  }

  private loadReferenceData() {
    this.staticDataService.getCountries().subscribe(countries => {
      this.countries = countries;
    });
    
    this.staticDataService.getNationalities().subscribe(nationalities => {
      this.nationalities = nationalities;
    });
    this.staticDataService.getRegions().subscribe(regions => {
      this.regions = regions;
    });

    this.initializePlacesOfBirth();
  }

  private initializePlacesOfBirth() {
    this.placesOfBirth = [
      { code: 'BDD', name: 'Bandundu' },
      { code: 'KIN', name: 'Kinshasa' },
      { code: 'LUB', name: 'Lubumbashi' },
      { code: 'MAT', name: 'Matadi' },
      { code: 'KIS', name: 'Kisangani' },
      { code: 'GOM', name: 'Goma' },
      { code: 'BUK', name: 'Bukavu' },
      { code: 'KAN', name: 'Kananga' },
      { code: 'MBU', name: 'Mbuji-Mayi' },
      { code: 'BEN', name: 'Beni' },
      { code: 'BUG', name: 'Butembo' },
      { code: 'KOL', name: 'Kolwezi' }
    ];
  }
  private getLanguageName(languageCode?: string): string | undefined {
    if (!languageCode) return undefined;
    
    // Use mappings directly
    return this.languageMappings[languageCode] || languageCode;
  }
  

  setAgent(filters: IKnownAgent) {
    this.selectedAgentSubject.next(filters);
  }

  setAgentData(agentCustomerData: CifInquiryObject) {
    const subsidiary: ISubsidiary = this.sessionService.subsidiary;
    const countryCode = subsidiary.countryCode;
    let referenceNum = null;
    let idTypeDesc = null;
    
    if (agentCustomerData.identificationDetails && agentCustomerData.identificationDetails.length > 0) {
      const primaryId = agentCustomerData.identificationDetails.find(id => id.preferredUniqueId === true) || 
                        agentCustomerData.identificationDetails[0];
      
      if (primaryId) {
        referenceNum = primaryId.referenceNum;
        idTypeDesc = primaryId.docDesc;
      }
    }

    const maritalStatus = agentCustomerData.personalDetails?.maritalStatus
      ? (new MaritalStatusPipe().transform(
          agentCustomerData.personalDetails.maritalStatus
        ) as string)
      : '';
    const gender = agentCustomerData.personalDetails?.gender
      ? (new GenderPipe().transform(
          agentCustomerData.personalDetails?.gender
        ) as string)
      : '';

      const languageName = this.getLanguageName(
        agentCustomerData.personalDetails?.language || 
        agentCustomerData.personalDetails?.preferredLanguageCode
      );
      

    const primaryPhoneNumber = new TransformPhoneNumberPipe().transform(
      agentCustomerData.contactDetails.phoneNumbers,
      'PRIMARY'
    );
    const primaryEmailAddress = new TransformEmailPipe().transform(
      agentCustomerData.contactDetails.emailAddresses,
      'PRIMARY'
    );
    const secondaryPhoneNumber = new TransformPhoneNumberPipe().transform(
      agentCustomerData.contactDetails.phoneNumbers,
      'SECONDARY'
    );
    const secondaryEmailAddress = new TransformEmailPipe().transform(
      agentCustomerData.contactDetails.emailAddresses,
      'SECONDARY'
    );
    const birthDate = agentCustomerData.personalDetails?.birthDate
      ? new Date(agentCustomerData.personalDetails.birthDate).toISOString().slice(0, 10)
      : '';

    const nationalityName = this.getNationalityName(agentCustomerData.personalDetails?.nationality);
    const countryName = this.getCountryName(agentCustomerData.personalDetails?.countryOfResidence);
    const idTypeName = this.getIdTypeName(agentCustomerData.personalDetails?.idType);
    const regionName = this.getRegionName(agentCustomerData.personalDetails?.region);
    const placeOfBirthName = this.getPlaceOfBirthName(agentCustomerData.personalDetails?.placeOfBirth);

    const detailsArray = [
      {
        id: 'firstName',
        label: 'KNOWN-AGENT.FIRST-NAME',
        value: agentCustomerData.personalDetails?.firstName,
        group: 'DETAILS',
      },
      {
        id: 'middleName',
        label: 'KNOWN-AGENT.MIDDLE-NAME',
        value: agentCustomerData.personalDetails?.middleName,
        group: 'DETAILS',
      },
      {
        id: 'lastName',
        label: 'KNOWN-AGENT.LAST-NAME',
        value: agentCustomerData.personalDetails?.lastName,
        group: 'DETAILS',
      },
      {
        id: 'otherName',
        label: 'KNOWN-AGENT.OTHER-NAME',
        value: agentCustomerData.personalDetails?.otherName,
        group: 'DETAILS',
      },
      { 
        id: 'gender', 
        label: 'COMMON.GENDER', 
        value: gender, 
        group: 'DETAILS' 
      },
      {
        id: 'nationality',
        label: 'COMMON.NATIONALITY',
        value: nationalityName,
        group: 'DETAILS',
      },
      {
        id: 'countryResidence',
        label: 'COMMON.COUNTRY-OF-RESIDENCE',
        value: countryName || this.getCountryName(subsidiary.countryCode), // Add fallback to subsidiary country
        group: 'DETAILS',
      },
      {
        id: 'dateBirth',
        label: 'KNOWN-AGENT.DATE-BIRTH',
        value: birthDate,
        group: 'DETAILS',
      },
      {
        id: 'placeOfBirth',
        label: 'COMMON.PLACE-OF-BIRTH',
        value: placeOfBirthName,
        group: 'DETAILS',
      },
      {
        id: 'region',
        label: 'COMMON.REGION',
        value: regionName,
        group: 'DETAILS',
      },
      {
        id: 'maritalStatus',
        label: 'COMMON.MARITAL-STATUS',
        value: maritalStatus,
        group: 'DETAILS',
      },
      {
        id: 'cif',
        label: 'KNOWN-AGENT.CIF',
        value: agentCustomerData.personalDetails?.customerId,
        group: 'DETAILS',
      },
      {
        id: 'idType',
        label: 'KNOWN-AGENT.ID-TYPE',
        value: idTypeDesc || agentCustomerData.personalDetails?.idType || 'N/A',
        group: 'DETAILS',
      },
      {
        id: 'idNumber',
        label: 'KNOWN-AGENT.ID-NUMBER',
        value: referenceNum || agentCustomerData.personalDetails?.idNumber || 'N/A',
        group: 'DETAILS',
      },
    ];


    detailsArray.push(
      {
        id: 'preferredLanguage',
        label: 'FORMS.PERSONAL_DETAILS.LABELS.PREFERRED_LANGUAGE',
        value: languageName,
        group: 'DETAILS',
      }
    );
    

    if (countryCode !== 'CD') {
      detailsArray.push({
        id: 'kraPin',
        label: 'KNOWN-AGENT.KRA-PIN',
        value: agentCustomerData.personalDetails?.krapInNumber,
        group: 'DETAILS',
      });
    } else if (agentCustomerData.personalDetails?.taxNumber) {
      detailsArray.push({
        id: 'taxNumber',
        label: 'Tax Number',
        value: agentCustomerData.personalDetails?.taxNumber,
        group: 'DETAILS',
      });
    }

    const additionalArray = [
      {
        id: 'primaryPhone',
        label: 'COMMON.PRIMARY-PHONE-NUMBER',
        value: primaryPhoneNumber,
        group: 'ADDITIONAL',
      },
      {
        id: 'secondaryPhone',
        label: 'ADDITIONAL-INFORMATION.SECONDARY-PHONE-NUMBER',
        value: secondaryPhoneNumber,
        group: 'ADDITIONAL',
      },
      {
        id: 'primaryEmail',
        label: 'COMMON.PRIMARY-EMAIL-ADDRESS',
        value: primaryEmailAddress,
        group: 'ADDITIONAL',
      },
      {
        id: 'secondaryEmail',
        label: 'ADDITIONAL-INFORMATION.SECONDARY-EMAIL-ADDRESS',
        value: secondaryEmailAddress,
        group: 'ADDITIONAL',
      },
      {
        id: 'customerRisk',
        label: 'KNOWN-AGENT.CUSTOMER-RISK',
        value: agentCustomerData.additionalInformation.riskRating,
        group: 'ADDITIONAL',
      },
      {
        id: 'highRiskType',
        label: 'KNOWN-AGENT.HIGH-RISK-TYPE',
        value: agentCustomerData.additionalInformation.highRiskCategory,
        group: 'ADDITIONAL',
      }
    ]; 
    return [...detailsArray, ...additionalArray];
  }

  private getCountryName(countryCode?: string): string | undefined {
    if (!countryCode) return undefined;
    
    const country = this.countries.find(c => c.countryCode === countryCode);
    return country ? country.countryName : countryCode;
  }

  private getNationalityName(nationalityCode?: string): string | undefined {
    if (!nationalityCode) return undefined;
    
    const nationality = this.nationalities.find(n => n.nationalityCode === nationalityCode);
    return nationality ? nationality.nationalityName : nationalityCode;
  }

  // Enhance the getRegionName method with fallback static mapping
  private getRegionName(regionCode?: string): string | undefined {
    if (!regionCode) return undefined;
    
    if (this.regions && this.regions.length > 0) {
      const region = this.regions.find(r => r.regionCode === regionCode);
      if (region) return region.regionName;
    }
    
    // Fallback to static mapping if not found in API data
    const regionMap: { [key: string]: string } = {
      'BAS': 'Bas-Congo',
      'KIN': 'Kinshasa',
      'EQU': 'Équateur',
      'ORI': 'Orientale',
      'NKV': 'Nord-Kivu',
      'SKV': 'Sud-Kivu',
      'MAN': 'Maniema',
      'KAT': 'Katanga',
      'KOC': 'Kasaï-Occidental',
      'KOR': 'Kasaï-Oriental'
      // Add more as needed
    };
    
    return regionMap[regionCode] || regionCode;
  }

  private getPlaceOfBirthName(placeOfBirthCode?: string): string | undefined {
    if (!placeOfBirthCode) return undefined;
    
    const place = this.placesOfBirth.find(p => p.code === placeOfBirthCode);
    return place ? place.name : placeOfBirthCode;
  }
  
  private languageMappings: { [key: string]: string } = {
    'en': 'English',
    'fr': 'French',
    'sw': 'Swahili',
    'ln': 'Lingala',
    'kg': 'Kikongo',
    'lua': 'Tshiluba',
    // Add other language mappings as needed
  };

  private getIdTypeName(idTypeCode?: string): string | undefined {
    if (!idTypeCode) return undefined;
    
    const idTypeMappings: { [key: string]: string } = {
      'NationalId': 'National ID',
      'ID': 'National ID',
      'PASSPORT': 'Passport',
      'PassportNo': 'Passport',
      'AlienID': 'Alien ID',
      'MilitaryID': 'Military ID',
      'DriverLicense': 'Drivers License',
      'CustomerID': 'Customer ID',
      'Voters Card': 'Voters Card',
    };
    
    return idTypeMappings[idTypeCode] || idTypeCode;
  }
}
