type Mt103ChargeDetails = Record<string, unknown>;

function hasRenderableValue(value: unknown): boolean {
  return value !== null && value !== undefined && !(typeof value === 'string' && value.trim() === '');
}

function pickFirstValue(...values: unknown[]): unknown {
  return values.find(hasRenderableValue);
}

export function normalizeMt103CheckerChargeDetails(chargeDetails?: Mt103ChargeDetails): Mt103ChargeDetails | undefined {
  if (!chargeDetails) {
    return chargeDetails;
  }

  const normalCharge = pickFirstValue(
    chargeDetails['NormalCharge'],
    chargeDetails['MainChargeAmount'],
    chargeDetails['AdditionalChargeAmount']
  );
  const vatAmount = pickFirstValue(chargeDetails['VatAmount'], chargeDetails['VATAmount']);
  const rscAmount = pickFirstValue(chargeDetails['RscAmount'], chargeDetails['RSCAmount']);
  const sumOfCharges = pickFirstValue(chargeDetails['SumOfCharges']);

  return {
    ...chargeDetails,
    ...(hasRenderableValue(normalCharge) ? { NormalCharge: normalCharge } : {}),
    ...(hasRenderableValue(vatAmount) ? { VatAmount: vatAmount } : {}),
    ...(hasRenderableValue(rscAmount) ? { RscAmount: rscAmount } : {}),
    ...(hasRenderableValue(sumOfCharges) ? { SumOfCharges: sumOfCharges } : {}),
  };
}
