import {SearchableItem} from "../form-controls";

export interface IDRCRegions {
    text: string;
    value: string;
}

export class DRCRegions implements SearchableItem {
    text: string;
    value: string;

    constructor(data: IDRCRegions) {
        this.text = data.text;
        this.value = data.value;
    }

    toInternal(): string {
        return this.value;
    }

    toString(): string {
        return this.text;
    }
}
