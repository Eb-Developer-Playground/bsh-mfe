import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transformCity',
})
export class TransformCityPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    const dropdownValues: any = args[0];
    const cities = dropdownValues.cityPlace;
    const found = cities.find((el: any) => el.cityPlaceCode === value);
    if (found) return found.cityPlaceName;
    else return value;
    return null;
  }
}
