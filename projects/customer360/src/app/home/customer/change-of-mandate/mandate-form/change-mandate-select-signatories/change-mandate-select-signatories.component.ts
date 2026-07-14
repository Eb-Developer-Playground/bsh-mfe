import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { IMandate } from '../../models/change-madate.model';
import { ChangeMandateSelectSignatoryComponent } from './change-mandate-select-signatory/change-mandate-select-signatory.component';
import { ChangeMandateNewSignatoryComponent } from './change-mandate-new-signatory/change-mandate-new-signatory.component';

@Component({
  selector: 'app-change-mandate-select-signatories',
  templateUrl: './change-mandate-select-signatories.component.html',
  styleUrls: ['./change-mandate-select-signatories.component.scss'],
  imports: [
    MatButtonModule,
    TranslatePipe,
    ChangeMandateSelectSignatoryComponent,
    ChangeMandateNewSignatoryComponent,
  ],
})
export class ChangeMandateSelectSignatoriesComponent
  implements OnInit, OnChanges
{
  @Input() signatories!: IMandate[];

  current: IMandate[] = [];
  available: IMandate[] = [];

  constructor() {}

  ngOnInit(): void {
    this.setSignatories();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['signatories'] && changes['signatories'].currentValue) {
      this.signatories = changes['signatories'].currentValue;
      this.setSignatories();
    }
  }

  public signatoriesChange(event: any) {
    /*this.signatories = this.signatories.map( sig =>  sig.name === event.name ? {...sig, current: event.current}  : sig );
        this.setSignatories();*/
  }

  private setSignatories() {
    if (this.signatories && this.signatories.length !== 0) {
      this.current = this.signatories.filter(
        mandate => mandate.signatoryType === 'M'
      );
      this.available = this.signatories.filter(
        mandate => mandate.signatoryType === 'A'
      );
    }
  }
}
