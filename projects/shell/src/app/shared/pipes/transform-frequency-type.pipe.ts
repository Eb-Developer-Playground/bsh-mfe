import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "transformFrequencyType",
    standalone: true
})
export class TransformFrequencyTypePipe implements PipeTransform {
    transform(value: unknown, ..._args: unknown[]): unknown {
        const frequencyTypes = [
            {name: "DAILY", value: "D"},
            {name: "WEEKLY", value: "W"},
            {name: "MONTHLY", value: "M"},
            {name: "YEARLY", value: "Y"}
        ];
        const found = frequencyTypes.find((el: any) => el.value === value);
        if (found) return found.name;
        else return value;
    }
}
