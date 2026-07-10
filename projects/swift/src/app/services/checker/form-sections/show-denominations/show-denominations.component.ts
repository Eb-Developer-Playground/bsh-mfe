import { Component, Input, OnInit } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../../shared-stubs/compat-barrel';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@Component({
  imports: [...COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  selector: 'app-show-denominations',
  templateUrl: './show-denominations.component.html',
  styleUrls: ['./show-denominations.component.scss'],
})
export class ShowDenominationsComponent implements OnInit {
  @Input() denominationsInfo!: any;
  @Input() management!: any[];
  @Input() title!: 'KE' | 'UG';
  @Input() country!: 'KE' | 'UG';
  @Input() transactionType!: 'Deposit' | 'Withdraw';
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

  constructor() {}

  ngOnInit(): void {
    this.calcTotalValue();
  }

  calcTotalValue = () => {
    const data = this.denominationsInfo.denominations;
    switch (this.country) {
      case 'KE':
        let sum = data.reduce((acc: any, cur: any) => acc + Number(cur['DenominationValue']), 0);
        this.totalValue['KE'] = sum.toFixed(2).toString();
        break;
      case 'UG':
        switch (this.transactionType) {
          case 'Deposit':
            let coinSumFit = 0;
            let noteSumFit = 0;
            let sumFit = 0;
            let coinSumUnfit = 0;
            let noteSumUnfit = 0;
            let sumUnfit = 0;
            data.forEach((value: any) => {
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
            let sum = data.reduce((acc: any, cur: any) => acc + Number(cur['DenominationValue']), 0);
            this.totalValue['UG']['Withdraw'] = sum.toFixed(2).toString();
            break;

          default:
            break;
        }
        break;

      default:
        break;
    }
  };
}
