export abstract class SearchableItem {
  abstract toInternal(): any;

  abstract toString(): any;
}

export class AutoCompleteItem implements SearchableItem {
  item: any;

  constructor(item: any) {
    this.item = item;
  }

  toInternal(): string {
    return this.item;
  }

  toString(): string {
    return this.item;
  }
}
