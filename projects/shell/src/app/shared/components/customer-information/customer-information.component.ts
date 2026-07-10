import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  output,
  Output,
  signal,
} from '@angular/core';
import { takeUntil } from 'rxjs';
import { AccountService, TicketsService } from '@app/core/services';
import { Unsub } from '../../utils/unsub';
import { SessionService } from '@app/shared/services';
import { ComponentsModule } from '@shared/components/components.module';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-shared-customer-information',
  templateUrl: './customer-information.component.html',
  styleUrls: ['./customer-information.component.scss'],
  standalone: true,
  imports: [ComponentsModule, CommonModule, TranslateModule],
})
export class CommonCustomerInformationComponent
  extends Unsub
  implements OnInit
{
  @Input() ticketId!: string;
  @Input() inProcess!: boolean;
  @Output() ticketData: EventEmitter<any> = new EventEmitter();
  @Output() cifData: EventEmitter<any> = new EventEmitter();
  @Input() isChangingSignatureAndPhoto: boolean = false;

  dataSignal = signal<any>({});

  customerData!: any;
  account: any;
  accountData: any;
  customerCif = '';

  constructor(
    private ticketService: TicketsService,
    private sessionService: SessionService,
    private accountService: AccountService
  ) {
    super();
  }
  ngOnInit() {
    this.getTicket();
  }

  getTicket() {
    this.ticketService
      .getTicket(this.ticketId)
      .pipe(takeUntil(this.cleanUp))
      .subscribe({
        next: (response: any) => {
          this.ticketData.emit(response);
          this.dataSignal.update(() => response);
          const taskData = JSON.parse(response?.taskData);
          this.account = taskData?.AccountId || taskData?.accountId;
          this.customerCif = response?.customerId || taskData.customerId;
          this.getCustomerDetails(this.customerCif);
        },
      });
  }

  getCustomerDetails(
    cif: string,
    bankId: string = this.sessionService.userBank
  ) {
    const url = `?Id=${cif}&bankId=${bankId}&idType=customerid`;
    this.accountService
      .getAccount(url)
      .pipe(takeUntil(this.cleanUp))
      .subscribe((res: any) => {
        this.customerData = res?.responseObject;
        this.cifData.emit(res?.responseObject);
        const accounts = this.customerData?.accounts?.filter(
          (account: any) => account?.schemeType !== 'LAA'
        );
        // this.account = accounts[0]?.accountNumber;
        this.accountData = this.customerData?.accounts.find(
          (account: any) => account.accountNumber === this.account
        );
      });
  }
}
