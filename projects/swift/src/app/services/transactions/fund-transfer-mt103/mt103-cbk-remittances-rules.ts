export type Mt103CbkRemittanceDecision = {
  shouldEnable: boolean;
  isRequired: boolean;
  shouldClear: boolean;
};

export function getCbkRemittanceDecision(
  bicCode: string | null | undefined,
  countryCode: string | null | undefined,
  productCode: string | null | undefined
): Mt103CbkRemittanceDecision {
  const isCentralBankOfKenya = bicCode === 'CBKEKENXXXX';
  const isKenyaRemitter = countryCode === 'KE';
  const isRtgsProduct = productCode === 'RTGS';

  if (isCentralBankOfKenya && isKenyaRemitter && isRtgsProduct) {
    return {
      shouldEnable: true,
      isRequired: true,
      shouldClear: false,
    };
  }

  if (!isCentralBankOfKenya && isKenyaRemitter && isRtgsProduct) {
    return {
      shouldEnable: false,
      isRequired: false,
      shouldClear: true,
    };
  }

  return {
    shouldEnable: false,
    isRequired: false,
    shouldClear: false,
  };
}
