import { Component, CUSTOM_ELEMENTS_SCHEMA, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, OnDestroy } from '@angular/core';
import { UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  DenominationDeliveryFormAttributes,
  DenominationFormAttributes,
} from '../../../../../core/models/denominations.model';
import { TransactionsService } from '../../../../../core/services';
import { COUNTRY_CODES } from '../../../../../shared/static';
import { TranslatePipe } from '../../../../shared-stubs/translate.pipe';
import { COMPAT_IMPORTS } from '../../../../shared-stubs/compat-barrel';

@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-denominations',
  templateUrl: './denominations.component.html',
  styleUrls: ['./denominations.component.scss'],
})
export class DenominationsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() title!: string;
  @Input() transactionType!: string;
  @Input() denominationsValue!: DenominationFormAttributes[];
  @Input() managedByValue!: DenominationFormAttributes[];
  @Input() managedForm!: UntypedFormGroup;
  @Output() onDenominations: EventEmitter<DenominationFormAttributes[]> = new EventEmitter();
  @Output() onManagedBy: EventEmitter<[]> = new EventEmitter();

  country!: any;
  deliveryForm!: UntypedFormGroup;
  denominations!: DenominationFormAttributes[];
  totalValue: any = {
    KE: '0.00',
    UG: {
      Deposit: {
        FIT: { coin: '0.00', note: '0.00', total: '0.00' },
        UNFIT: { coin: '0.00', note: '0.00', total: '0.00' },
      },
      Withdraw: '0.00',
    },
  };
  fieldsForm!: UntypedFormGroup;

  private destroy$: Subject<any> = new Subject<any>();

  constructor(
    private fb: UntypedFormBuilder,
    private transService: TransactionsService
  ) {
    this.deliveryForm = this.fb.group({
      PFFormArray: this.fb.array([]),
    });
    this.fieldsForm = this.fb.group({
      Denominations: this.fb.array([]),
      ManagedBy: this.fb.array([]),
      totalValueA: [{ value: '', disabled: true }],
      totalValueB: [{ value: '', disabled: true }],
      officialAmountA: [''],
      officialAmountB: [''],
    });
  }

  ngOnInit(): void {
    this.fieldsForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(data => {
      if (data.Denominations && data.Denominations.length !== 0) {
        const denominationsArray: DenominationFormAttributes[] = data.Denominations;
        const managedByArray: [] = data.ManagedBy;

        let total = 0;
        denominationsArray.forEach(denomination => {
          total += isNaN(+denomination['DenominationValue']) ? 0 : +denomination['DenominationValue'];
        });
        this.onDenominations.emit(denominationsArray);
        this.onManagedBy.emit(managedByArray);
        this.totalValue['KE'] = total;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && changes['transactionType'] && changes['transactionType'].currentValue) {
      const {
        transactionType: { currentValue: transType },
      } = changes;
      if (transType) {
        this.country = COUNTRY_CODES.find(code => code.bankId === this.transService.ticket.bankId).countryCode;
        this.getDenominations(this.country, transType);
      }
    }
  }

  getDenominations(countryCode: string, transactionType: string) {
    this.transService.getDenominationsData(countryCode, transactionType).subscribe((res: any) => {
      if (res.successful && res.responseObject.denomination) {
        this.denominations = res.responseObject.denomination;
        this.createDenominationsTable(this.denominations, this.country, this.transService.ticket.transactionType);
        this.createManagedByTable(this.country, this.transService.ticket.transactionType);
        this.fieldsForm.patchValue({
          Denominations: this.denominationsValue,
          ManagedBy: this.managedByValue,
        });
        this.calcTotalValue();
      }
    });
  }

  calcTotalValue() {
    const data = this.fieldsForm.get('Denominations') as UntypedFormArray;
    switch (this.country) {
      case 'KE':
        let sum = data.value.reduce((acc: number, cur: any) => acc + Number(cur['DenominationValue']), 0);
        this.totalValue['KE'] = sum.toFixed(2).toString();
        break;
      case 'UG':
        switch (this.transService.ticket.transactionType) {
          case 'Deposit':
            let coinSumFit = 0;
            let noteSumFit = 0;
            let sumFit = 0;
            let coinSumUnfit = 0;
            let noteSumUnfit = 0;
            let sumUnfit = 0;
            data.value.forEach((value: any) => {
              switch (value.DenominationCategory) {
                case 'FIT':
                  switch (value.DenominationPackageName) {
                    case 'coin':
                      coinSumFit += Number(value.DenominationValue);
                      sumFit += Number(value.DenominationValue);
                      this.totalValue['UG']['Deposit']['FIT']['coin'] = coinSumFit.toFixed(2).toString();
                      this.totalValue['UG']['Deposit']['FIT']['total'] = sumFit.toFixed(2).toString();
                      break;
                    case 'note':
                      noteSumFit += Number(value.DenominationValue);
                      sumFit += Number(value.DenominationValue);
                      this.totalValue['UG']['Deposit']['FIT']['note'] = noteSumFit.toFixed(2).toString();
                      this.totalValue['UG']['Deposit']['FIT']['total'] = sumFit.toFixed(2).toString();
                      break;
                    default:
                      break;
                  }
                  break;
                case 'UNFIT':
                  switch (value.DenominationPackageName) {
                    case 'coin':
                      coinSumUnfit += Number(value.DenominationValue);
                      sumUnfit += Number(value.DenominationValue);
                      this.totalValue['UG']['Deposit']['UNFIT']['coin'] = coinSumUnfit.toFixed(2).toString();
                      this.totalValue['UG']['Deposit']['UNFIT']['total'] = sumUnfit.toFixed(2).toString();
                      break;
                    case 'note':
                      noteSumUnfit += Number(value.DenominationValue);
                      sumUnfit += Number(value.DenominationValue);
                      this.totalValue['UG']['Deposit']['UNFIT']['note'] = noteSumUnfit.toFixed(2).toString();
                      this.totalValue['UG']['Deposit']['UNFIT']['total'] = sumUnfit.toFixed(2).toString();
                      break;
                    default:
                      break;
                  }
                  break;
                default:
                  break;
              }
            });
            break;
          case 'Withdraw':
            let sum = data.value.reduce(
              (acc: number, cur: { [x: string]: any }) => acc + Number(cur['DenominationValue']),
              0
            );
            this.totalValue['UG']['Withdraw'] = sum.toFixed(2).toString();
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  createManagedByTable = (countryCode: string, transactionType: any) => {
    const data = this.fieldsForm.get('ManagedBy') as UntypedFormArray;
    const managedByLength = countryCode === 'KE' ? 2 : 4;

    switch (countryCode) {
      case 'KE':
        Array.from(Array(managedByLength)).forEach(() => data.push(this.fb.group({ Name: '' })));
        break;
      case 'UG':
        switch (transactionType) {
          case 'Deposit':
            Array.from(Array(managedByLength)).forEach(() =>
              data.push(
                this.fb.group({
                  Name: '',
                  PFNumber: '',
                  DenominationPackageName: 'coin',
                })
              )
            );
            Array.from(Array(managedByLength)).forEach(() =>
              data.push(
                this.fb.group({
                  Name: '',
                  PFNumber: '',
                  DenominationPackageName: 'note',
                })
              )
            );
            break;
          case 'Withdraw':
            Array.from(Array(managedByLength)).forEach(() => data.push(this.fb.group({ Name: '', PFNumber: '' })));
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
  };

  createDenominationsTable(denominationsData: any[], countryCode: string, transactionType: any) {
    const data = this.fieldsForm.get('Denominations') as UntypedFormArray;
    switch (countryCode) {
      case 'KE':
        denominationsData.forEach(denomination =>
          data.push(
            this.fb.group({
              DenominationName: denomination.denominationName,
              DenominationPackageName: denomination.denominationType,
              DenominationValue: '',
            })
          )
        );
        break;
      case 'UG':
        switch (transactionType) {
          case 'Deposit':
            denominationsData.forEach(denomination =>
              data.push(
                this.fb.group({
                  DenominationName: denomination.denominationValue.toString(),
                  DenominationPackageName: denomination.denominationType,
                  DenominationCategory: denomination.denominationCategory,
                  DenominationPackage: '',
                  DenominationValue: '',
                })
              )
            );
            break;
          case 'Withdraw':
            denominationsData.forEach(denomination =>
              data.push(
                this.fb.group({
                  DenominationName: denomination.denominationValue.toString(),
                  DenominationPackageName: denomination.denominationType,
                  DenominationValue: '',
                })
              )
            );
            break;

          default:
            break;
        }
        break;
      default:
        break;
    }
    // console.log('FORM', this.fieldsForm.value);
  }

  get ManagedBy(): UntypedFormArray {
    return this.fieldsForm.get('ManagedBy') as UntypedFormArray;
  }

  get Denominations(): UntypedFormArray {
    return this.fieldsForm.get('Denominations') as UntypedFormArray;
  }

  get PFFormArrayM(): UntypedFormArray {
    return this.deliveryForm.get('PFFormArray') as UntypedFormArray;
  }

  createDeliveryForm(fields: DenominationDeliveryFormAttributes[]) {
    fields.forEach(el => {
      this.PFFormArrayM.push(
        this.fb.group({
          name: el.name,
          PFName: el.PFName,
        })
      );
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
