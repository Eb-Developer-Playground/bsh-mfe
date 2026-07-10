import { SearchableItem } from '../form-controls';

export interface IGender {
  genderType: string;
  value: string;
  categoryType: string;
}

export class Gender implements SearchableItem {
  genderType!: string;
  value!: string;
  categoryType!: string;

  constructor(data: IGender) {
    this.genderType = data.genderType;
    this.value = data.value;
    this.categoryType = data.categoryType;
  }

  toInternal(): string {
    return this.value;
  }

  toString(): string {
    return this.genderType;
  }
}

//bankId
// cityPlace
// country
// county
// currResidence
// designationMaster
// gender
// incomeNature
// industrySector
// mandate
// maritalStatus
// nationality
// occupation
// physicalAddress
// postal_codes
// profession
// region
// relation
// religion
// riskCategory
// scheme_Code
// title
// townCity
//
