import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "transformDispatchMode",
    standalone: true
})
export class TransformDispatchModePipe implements PipeTransform {
    transform(value: unknown, ..._args: unknown[]): unknown {
        const dispatchModes = [
            {name: "COLLECT ONLY", value: "C"},
            {name: "EMAIL ONLY", value: "E"},
            {name: "POST ONLY", value: "P"}
        ];
        const found = dispatchModes.find((el: any) => el.value === value);
        if (found) return found.name;
        else return value;
    }
}
