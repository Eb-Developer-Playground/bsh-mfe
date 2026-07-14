import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import {
  CardProductTypesResponse,
  CardTypeChargesResponseT,
  CardTypeT,
  InstantCardIssuanceFormKeysT,
  StaffInventoryResponseT,
} from '@app/home/customer/card-issuance/card-issuance.models';
import { FormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CardIssuanceApisService } from '@app/home/customer/card-issuance/services/card-issuance-apis.service';
import { CardIssuanceService } from '@app/home/customer/card-issuance/services/card-issuance.service';
import { SessionService } from '@shared/services';
import { CardInputComponent } from '@app/home/customer/card-issuance/components/card-input/card-input.component';
import { ActionButtonComponent } from '@app/home/customer/card-issuance/components/action-button/action-button.component';

@Component({
  selector: 'app-card-details-section',
  templateUrl: './card-details-section.component.html',
  styleUrls: [
    '../../card-issuance.component.scss',
    './card-details-section.component.scss',
  ],
  imports: [
    ReactiveFormsModule,
    CardInputComponent,
    ActionButtonComponent,
  ],
})
export class CardDetailsSectionComponent implements OnInit {
  @Input() issuanceType: 'INSTANT' | 'PREMIUM' | 'PREPAID' = 'INSTANT';
  @Input({ required: true }) FormGroup!: FormGroup;
  @Input({ required: true }) cardTypeCharges: 'loading' | 'triggered' | 'n/a' =
    'n/a';
  @Output() updateForm: EventEmitter<{
    formKey: keyof InstantCardIssuanceFormKeysT;
    value: any;
  }> = new EventEmitter();
  @Output() updateCardTypeChargesState = new EventEmitter();
  @Output() updateIssuanceType = new EventEmitter();
  @Output() disableInput: EventEmitter<{ inputName: string }> =
    new EventEmitter();

  private subscriptions: Subscription = new Subscription();
  panValidity: 'loading' | 'success' | 'normal' = 'normal';
  loadingProductTypes: boolean = false;
  cardTypes: CardTypeT[] = [];
  cardTypeOptions: {
    value: string;
    label: string;
  }[] = [];

  constructor(
    private cardIssuanceApisService: CardIssuanceApisService,
    private cardIssuanceService: CardIssuanceService,
    private sessionService: SessionService,
    protected fb: UntypedFormBuilder
  ) {}

  ngOnInit(): void {
    this.triggerGetProductTypes();
    const cardTypeInputSubscription = this.FormGroup.get(
      'cardType'
    )?.valueChanges.subscribe(value => {
      this.triggerCardTypeCharges(value);
    });
    this.subscriptions.add(cardTypeInputSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  triggerGetProductTypes = () => {
    const apiCall: Observable<CardProductTypesResponse> =
      this.cardIssuanceApisService.getProductTypes({
        countryCode: this.sessionService.userCountryCode,
      });
    this.loadingProductTypes = true;
    this.cardIssuanceService.callApi(
      apiCall,
      this.handleSuccessfulProductTypesGetter
    );
  };
  handleSuccessfulProductTypesGetter = (
    isSuccess: boolean,
    response: CardProductTypesResponse
  ) => {
    this.loadingProductTypes = false;
    this.cardTypes = response.responseObject.map(cardType => ({
      countryCode: cardType.countryCode,
      group: cardType.group,
      id: cardType.id,
      name: cardType.name,
      categoryId: cardType.categoryId.toString(),
    }));
    this.cardTypeOptions = this.cardTypes.map(cardType => ({
      value: cardType.id,
      label: cardType.name,
    }));
  };

  triggerCardTypeCharges = (cardTypeId: string) => {
    const cardTypeInfo = this.cardTypes.find(typ => typ.id === cardTypeId);
    if (cardTypeInfo) {
      if (String(cardTypeId) === '25') {
        this.updateIssuanceType.emit('PREPAID');
      } else if (String(cardTypeId) === '14') {
        this.updateIssuanceType.emit('INSTANT');
      } else if (cardTypeInfo.group) {
        this.updateIssuanceType.emit(cardTypeInfo.group);
      }
    }
    const apiCall: Observable<CardTypeChargesResponseT> =
      this.cardIssuanceApisService.getCardTypeCharges({
        productTypeId: this.FormGroup.get('cardType')?.value || '14',
      });
    this.updateCardTypeChargesState.emit('loading');
    this.cardIssuanceService.callApi(
      apiCall,
      this.handleSuccessfulCardTypeCharges
    );
  };
  handleSuccessfulCardTypeCharges = (
    isSuccess: boolean,
    data: CardTypeChargesResponseT
  ) => {
    this.updateCardTypeChargesState.emit('triggered');
    this.updateForm.emit({
      formKey: 'ecommerceLimit',
      value: data.responseObject[0].dailyEcommerceTransactionLimit,
    });
    this.disableInput.emit({ inputName: 'ecommerceLimit' });

    this.updateForm.emit({
      formKey: 'withdrawalLimit',
      value: data.responseObject[0].dailyCashWithdrawalLimit,
    });
    this.disableInput.emit({ inputName: 'withdrawalLimit' });

    this.updateForm.emit({
      formKey: 'chargeAmount',
      value: data.responseObject[0].chargeAmount,
    });
    this.disableInput.emit({ inputName: 'chargeAmount' });

    this.updateForm.emit({
      formKey: 'taxAmount',
      value: data.responseObject[0].taxAmount,
    });
    this.disableInput.emit({ inputName: 'taxAmount' });
  };

  validatePan = () => {
    this.panValidity = 'loading';
    const panValue = this.FormGroup.get('cardPAN')?.value;

    if (!panValue) {
      this.panValidity = 'normal';
      return;
    }

    const apiCall2: Observable<StaffInventoryResponseT> =
      this.cardIssuanceApisService.validatePanV2({
        Pan: panValue,
      });

    const subscription = apiCall2.subscribe({
      next: response => {
        this.handleSuccessfulPanValidation();
      },
      error: error => {
        this.handlePanValidationError(error);
      },
    });

    this.subscriptions.add(subscription);
  };

  handleSuccessfulPanValidation = () => {
    this.panValidity = 'success';
    this.updateForm.emit({ formKey: 'cardPANValid', value: true });
  };

  handlePanValidationError = (error: any) => {
    this.panValidity = 'normal';
    this.updateForm.emit({ formKey: 'cardPANValid', value: false });
  };
}
