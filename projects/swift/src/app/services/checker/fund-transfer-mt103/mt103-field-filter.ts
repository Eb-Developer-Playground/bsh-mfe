type CheckerField = {
  key: string;
  [key: string]: unknown;
};

type CheckerTicketDataSection = Record<string, unknown>;
type CheckerTicketData = Record<string, CheckerTicketDataSection | undefined>;

export function hasMt103CheckerFieldValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    const trimmedValue = value.trim();
    return trimmedValue !== '' && trimmedValue !== '---';
  }

  if (typeof value === 'number') {
    return !isNaN(value);
  }

  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }

  return Boolean(value);
}

export function filterMt103CheckerFieldsWithValues(
  fields: CheckerField[],
  data: CheckerTicketData,
  sectionName: string
): CheckerField[] {
  return fields.filter(field => {
    const value = data[sectionName]?.[field.key];
    return hasMt103CheckerFieldValue(value);
  });
}
