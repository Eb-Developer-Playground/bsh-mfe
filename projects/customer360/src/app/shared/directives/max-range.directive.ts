import {
  Directive,
  Inject,
  Injectable,
  Input,
  numberAttribute,
} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {
  DateRange,
  MAT_DATE_RANGE_SELECTION_STRATEGY,
  MatDateRangeSelectionStrategy,
} from '@angular/material/datepicker';

@Injectable()
export class MaxRangeSelectionStrategy<D>
  implements MatDateRangeSelectionStrategy<D>
{
  start: any;
  public delta!: number;

  constructor(private _dateAdapter: DateAdapter<D>) {}

  selectionFinished(date: D, currentRange: DateRange<D>) {
    let { start, end } = currentRange;
    if (start == null || (start && end)) {
      start = date;
      end = null;
    } else if (end == null) {
      const maxDate = this._dateAdapter.addCalendarDays(start, this.delta);
      end = date ? (date > maxDate ? maxDate : date) : null;
    }

    return new DateRange<D>(start, end);
  }

  createPreview(
    activeDate: D | null,
    currentRange: DateRange<D>
  ): DateRange<D> {
    if (currentRange.start && !currentRange.end) {
      const maxDate = this._dateAdapter.addCalendarDays(
        currentRange.start,
        this.delta
      );
      const rangeEnd = activeDate
        ? activeDate > maxDate
          ? maxDate
          : activeDate
        : null;

      return new DateRange(currentRange.start, rangeEnd);
    }

    return new DateRange<D>(null, null);
  }
}

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[maxRange]',
  providers: [
    {
      provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
      useClass: MaxRangeSelectionStrategy,
    },
  ],
})
export class MaxRangeDirective {
  constructor(
    @Inject(MAT_DATE_RANGE_SELECTION_STRATEGY)
    private maxRangeStrategy: MaxRangeSelectionStrategy<any>
  ) {}

  @Input({ transform: numberAttribute }) set maxRange(value: number) {
    this.maxRangeStrategy.delta = +value || 7;
  }
}
