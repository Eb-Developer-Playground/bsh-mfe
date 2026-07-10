export type Mt103InstrumentRuleDecision = {
  dateValidatorsRequired: boolean;
  dateEnabled: boolean;
  numberValidatorsRequired: boolean;
  numberEnabled: boolean;
  clearDate: boolean;
  clearNumber: boolean;
};

export function getMt103InstrumentRuleDecision(
  instrumentType: string,
  countryCode: string
): Mt103InstrumentRuleDecision {
  if (!instrumentType) {
    return {
      dateValidatorsRequired: false,
      dateEnabled: false,
      numberValidatorsRequired: false,
      numberEnabled: false,
      clearDate: true,
      clearNumber: true,
    };
  }

  if (instrumentType === 'OV') {
    return {
      dateValidatorsRequired: false,
      dateEnabled: countryCode === 'CD',
      numberValidatorsRequired: false,
      numberEnabled: true,
      clearDate: false,
      clearNumber: false,
    };
  }

  return {
    dateValidatorsRequired: true,
    dateEnabled: true,
    numberValidatorsRequired: true,
    numberEnabled: true,
    clearDate: false,
    clearNumber: false,
  };
}
