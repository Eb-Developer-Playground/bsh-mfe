import { SearchableItem } from '../form-controls';

export interface IIndustrySector {
  industryCode: string;
  industry: string;
  sector: string;
  sectorCode: string;
}

export class IndustrySector implements SearchableItem {
  industryCode: string;
  industry: string;
  sector: string;
  sectorCode: string;

  constructor(data: IIndustrySector) {
    this.industryCode = data.industryCode;
    this.industry = data.industry;
    this.sector = data.sector;
    this.sectorCode = data.sectorCode;
  }

  toInternal(): string {
    return this.sector;
  }

  toString(): string {
    return this.sectorCode;
  }
}
