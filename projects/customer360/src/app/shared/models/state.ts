import { SearchableItem } from "./searchable";

export interface IState {
    code: string;
    name: string;
    isDeleted: boolean;
}

export class State implements SearchableItem {
    code: string;
    name: string;
    isDeleted: boolean;

    constructor(data: IState) {
        this.code = data.code;
        this.name = data.name;
        this.isDeleted = data.isDeleted;
    }

    toInternal(): string {
        return this.code;
    }

    toString(): string {
        return this.name;
    }
}
