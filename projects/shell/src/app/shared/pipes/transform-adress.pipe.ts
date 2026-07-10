import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformAddress',
})
export class TransformAddressPipe implements PipeTransform {
  transform(
    addresses: {
      addressId: string;
      county: string;
      country: string;
      constituency: string;
      district: any;
      division: any;
      location: string;
      subLocation: any;
      postalAddress: string;
      cityCode: string;
      city: string;
      village: string;
      estate: any;
      poBox: any;
      postalCode: string;
      stateProvince: any;
      addressType: string;
      preferred: boolean;
      building: any;
      currentPlaceOfResidence: any;
      addressStartDate: string;
      toBeDeleted: boolean;
      comment: any;
    }[],
    type:
      | 'PHYSICAL-ADDRESS'
      | 'CITY'
      | 'COUNTY'
      | 'POSTALADDRESS'
      | 'POSTALCODE'
      | 'VILLAGE',
    preferred: 'PRIMARY' | 'SECONDARY' = 'PRIMARY',
    ...args: unknown[]
  ): string {
    const _preferred = preferred === 'PRIMARY' ? true : false;
    const dropdownValues: any = args[0];

    let currentObjectArray: any[] = [];
    let currentKey = '';
    let currentDisplayValue = '';
    let currentValueKey = '';

    const currentAddress = addresses.find(
      address => address.preferred === _preferred
    );

    if (!currentAddress) {
      return '';
    }
    switch (type) {
      case 'VILLAGE':
        currentValueKey = currentAddress.village;
        currentObjectArray = [{ village: currentAddress.village }];
        currentKey = 'village';
        currentDisplayValue = 'village';
        break;
      case 'POSTALCODE':
        currentValueKey = currentAddress.postalCode;
        currentObjectArray = [{ postalCode: currentAddress.postalCode }];
        currentKey = 'postalCode';
        currentDisplayValue = 'postalCode';
        break;
      case 'POSTALADDRESS':
        currentValueKey = currentAddress.postalAddress;
        currentObjectArray = [{ postalAddress: currentAddress.postalAddress }];
        currentKey = 'postalAddress';
        currentDisplayValue = 'postalAddress';
        break;

      case 'CITY':
        currentValueKey = currentAddress.city;
        currentObjectArray = dropdownValues.cityPlace;
        currentKey = 'cityPlaceCode';
        currentDisplayValue = 'cityPlaceName';
        break;

      case 'COUNTY':
        currentValueKey = currentAddress.county;
        currentObjectArray = dropdownValues.county.filter(
          (county: any) => !county.isDeleted
        );
        currentKey = 'ref_Code';
        currentDisplayValue = 'ref_Desc';
        break;
      case 'PHYSICAL-ADDRESS':
        currentKey = 'physicalAddress';
        currentDisplayValue = 'physicalAddress';

        const currentCity = dropdownValues.cityPlace.find(
          (city: { cityPlaceCode: string; cityPlaceName: string }) =>
            city.cityPlaceCode === currentAddress?.city
        )?.cityPlaceName;

        currentValueKey = `<${currentAddress.poBox}-${currentAddress.postalCode}> ${currentCity}`;
        currentObjectArray = [{ physicalAddress: currentValueKey }];

        break;
      default:
        break;
    }
    const found = currentObjectArray.find(
      (el: any) => el[currentKey] === currentValueKey
    );
    if (found) return found[currentDisplayValue];
    else return '';
    return '';
  }
}
