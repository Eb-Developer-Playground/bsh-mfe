import {Pipe, PipeTransform} from "@angular/core";
import {default as SUBSIDIARIES} from "../../../assets/data/subsidiaries.json";

interface SubsidiaryEntry {
  bankId: string;
  countryCode: string;
  countryName: string;
}

@Pipe({
    name: "transformSubsidiary",
})
export class TransformSubsidiaryPipe implements PipeTransform {
    transform(value: string): string {
        if (["43", "CD"].includes(value)) // Truncated name, too long
            return "DR Congo"
        const entry = (SUBSIDIARIES.responseObject as SubsidiaryEntry[]).find(
            (c: SubsidiaryEntry) => c.countryCode === value.trim() || c.bankId === value.trim()
        );
        return entry?.countryName || value;
    }
}
