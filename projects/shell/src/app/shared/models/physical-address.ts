import { SearchableItem } from '../form-controls';

export interface IPhysicalAddress {
  county: string;
  constituency: string;
  district: string;
  division: string;
  location: string;
  subLocation: string;
  undefined: string;
}

export class PhysicalAddress implements SearchableItem {
  county: string;
  constituency: string;
  district: string;
  division: string;
  location: string;
  subLocation: string;
  undefined: string;

  constructor(data: IPhysicalAddress) {
    this.county = data.county;
    this.constituency = data.constituency;
    this.district = data.district;
    this.division = data.division;
    this.location = data.location;
    this.subLocation = data.subLocation;
    this.undefined = data.subLocation;
  }

  toInternal(): string {
    return this.county;
  }

  toString(): string {
    return this.county;
  }
}
