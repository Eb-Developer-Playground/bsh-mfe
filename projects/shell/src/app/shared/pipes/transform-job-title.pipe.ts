import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformJobTitle',
  standalone: false,
})
export class TransformJobTitlePipe implements PipeTransform {
  transform(value: any, ...args: unknown[]): any {
    const dropdownValues: any = args[0];
    const jobTitles = dropdownValues.designationMaster;
    const found = jobTitles.find((el: any) => el.refCode === value);
    if (found) return found.refDesc;
    else return value;
  }
}
