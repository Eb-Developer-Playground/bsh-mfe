import { SearchableItem } from '../form-controls';

export interface IRiskCategory {
  category: string;
}

export class RiskCategory implements SearchableItem {
  category: string;

  constructor(data: IRiskCategory) {
    this.category = data.category;
  }

  toInternal(): string {
    return this.category;
  }

  toString(): string {
    return this.category;
  }
}
