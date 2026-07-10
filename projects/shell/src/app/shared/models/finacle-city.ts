import { SearchableItem } from '@app/shared/models';

export interface IFinacleCity {
  cityPlaceCode: string;
  cityPlaceName: string;
}

export class FinacleCity implements SearchableItem {
  cityPlaceCode!: string;
  cityPlaceName!: string;

  constructor(data: IFinacleCity) {
    this.cityPlaceCode = data.cityPlaceCode;
    this.cityPlaceName = data.cityPlaceName;
  }

  toInternal(): string {
    return this.cityPlaceCode;
  }

  toString(): string {
    return this.cityPlaceName;
  }
}
