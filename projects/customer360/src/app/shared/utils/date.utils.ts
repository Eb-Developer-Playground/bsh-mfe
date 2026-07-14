export function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toYMD(value: Date | string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function todayYMD(): string {
  return toYMD(new Date());
}

export function daysAgoYMD(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toYMD(date);
}

export function addDays(date: Date | string, days: number): Date {
  const result = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date | string, months: number): Date {
  const result = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: Date | string, years: number): Date {
  const result = date instanceof Date ? new Date(date.getTime()) : new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function isBefore(a: Date | string, b: Date | string): boolean {
  return new Date(a).getTime() < new Date(b).getTime();
}

export function isAfter(a: Date | string, b: Date | string): boolean {
  return new Date(a).getTime() > new Date(b).getTime();
}

export function localDate(value: Date | string | null | undefined): Date {
  if (!value) {
    return new Date(NaN);
  }
  return new Date(value);
}