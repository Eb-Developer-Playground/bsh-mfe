type RoutingCodeOption = {
  code: string;
};

type SelectOption = {
  label: string;
  value: string;
};

export function getRoutingCodeOptionsByCurrency(currency: string, routingCodes: RoutingCodeOption[]): SelectOption[] {
  switch (currency) {
    case 'USD':
      return [{ label: 'Fedwire', value: 'Fedwire' }];
    case 'GBP':
      return [{ label: 'Sort Code', value: 'Sort Code' }];
    case 'AUD':
      return [{ label: 'AU code', value: 'AU code' }];
    case 'ZAR':
      return [{ label: 'ZA code', value: 'ZA code' }];
    default:
      return routingCodes.map(routingCode => ({
        label: routingCode.code,
        value: routingCode.code,
      }));
  }
}

export function getBeneficiaryCountryCodeByRoutingCode(routingCode: string): string | null {
  switch (routingCode) {
    case 'Fedwire':
      return 'US';
    case 'Sort Code':
      return 'GB';
    case 'AU Code':
    case 'AU code':
      return 'AU';
    case 'ZA Code':
    case 'ZA code':
      return 'ZA';
    default:
      return null;
  }
}
