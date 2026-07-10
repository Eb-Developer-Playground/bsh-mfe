import {Pipe, PipeTransform} from "@angular/core";
import {default as populateOptions} from "../../../assets/data/populate-dropdown.json";

@Pipe({
    name: "transformMandate",
    standalone: true
})
export class TransformMandatePipe implements PipeTransform {
    transform(value: unknown, ..._args: unknown[]): unknown {
        return populateOptions.responseObject.mandate.find(
            (mandate: {ref_Code: string}) => mandate.ref_Code === value
        )?.ref_Desc;
    }
}
