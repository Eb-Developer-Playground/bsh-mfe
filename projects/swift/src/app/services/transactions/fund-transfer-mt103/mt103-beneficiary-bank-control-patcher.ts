import { FormGroup, Validators } from '@angular/forms';
import { Mt103CbkRemittanceDecision } from './mt103-cbk-remittances-rules';
import { Mt103RoutingCodeValueValidatorDecision } from './mt103-bic-routing-validators';

type BeneficiaryBankClearScenario = 'onBicSelect' | 'onRoutingCodeSelect';

type BeneficiaryBankPatcherDecisions = {
  cbkRemittance?: Mt103CbkRemittanceDecision;
  routingCodeValue?: Mt103RoutingCodeValueValidatorDecision;
  countryCode?: string | null;
};

export function applyBeneficiaryBankControlClear(
  beneficiaryBankForm: FormGroup,
  scenario: BeneficiaryBankClearScenario,
  decisions: BeneficiaryBankPatcherDecisions = {}
): void {
  const accountWithInstitutionBic = beneficiaryBankForm.get('AccountWithInstitutionBic');
  const routingCode = beneficiaryBankForm.get('RoutingCode');
  const routingCodeValue = beneficiaryBankForm.get('RoutingCodeValue');
  const cbkRemittances = beneficiaryBankForm.get('CbkRemittances');
  const beneficiaryCountryCode = beneficiaryBankForm.get('BeneficiaryCountryCode');

  if (scenario === 'onBicSelect') {
    routingCode?.setValue('');
    routingCodeValue?.setValue('');
    routingCodeValue?.setValidators(null);
    routingCodeValue?.updateValueAndValidity();

    const cbkDecision = decisions.cbkRemittance;
    if (cbkDecision) {
      if (cbkDecision.shouldClear) {
        cbkRemittances?.setValue('');
      }

      cbkRemittances?.setValidators(cbkDecision.isRequired ? [Validators.required] : null);
      if (cbkDecision.shouldEnable) {
        cbkRemittances?.enable();
      } else {
        cbkRemittances?.disable();
      }
    }

    return;
  }

  accountWithInstitutionBic?.setValidators(null);
  accountWithInstitutionBic?.markAsDirty();
  accountWithInstitutionBic?.setValue('');
  accountWithInstitutionBic?.updateValueAndValidity();

  cbkRemittances?.setValidators(null);
  cbkRemittances?.setValue('');
  cbkRemittances?.disable();

  const routingDecision = decisions.routingCodeValue;
  routingCodeValue?.setValidators(routingDecision?.requiresValue ? [Validators.required] : null);

  if (decisions.countryCode) {
    beneficiaryCountryCode?.setValue(decisions.countryCode);
  }
}
