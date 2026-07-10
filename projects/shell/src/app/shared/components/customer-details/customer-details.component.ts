import { AfterViewInit,
  Component,
  Input,
  OnDestroy,
  OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { TicketsService } from 'src/app/core/services';
import { ChannelsService } from 'src/app/core/services/channels/channels.service';
import { AccountService, SessionService } from '../../services';

@Component({
  selector: 'app-customer-details',
  templateUrl: './customer-details.component.html',
  styleUrls: ['./customer-details.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class CustomerDetailsComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() ticketId!: string;
  bankID!: string;
  customerCif!: string;
  customerDetails: any;
  taskData: any;
  canDisplayImage = false;
  channels: any = [];
  constructor(
    private accountService: AccountService,
    private ticketsService: TicketsService,
    private sessionService: SessionService,
    private channelsService: ChannelsService
  ) {}

  ngOnInit() {
    this.getTicket();
    this.canDisplayImage = this.sessionService.hasFeatureRole(
      'AccountManagement.ViewSignatureAndPhoto'
    );
  }

  ngAfterViewInit(): void {}

  getCustomerDetails(cif: string, bankID: string) {
    const url = `?Id=${cif}&bankId=${bankID}&idType=customerid`;
    this.accountService.getAccount(url).subscribe(res => {
      this.customerDetails = res.responseObject;
      this.getCustomerChannels(this.customerCif, this.bankID);
      this.storeUser(res.responseObject);
    });
  }

  storeUser = (value: any) => {
    const objAcc = {
      cif: value.cif,
      bankID: value.bankID,
      idNumber: value.identifications[0]?.id,
      accountsId: value.accounts[0]?.accountNumber,
      firstName: value.firstName,
      lastName: value.lastName,
      dateOfBirth: value.dateOfBirth,
      idType: value.identifications[0]?.type,
      mandate: value.accounts[0]?.mandate,
      accountType: value.accounts[0]?.schemeType,
      isPresent: true,
    };
    localStorage.setItem('accMgntObj', JSON.stringify(objAcc));
  };

  getTicket() {
    this.ticketsService.getTicket(this.ticketId).subscribe(res => {
      this.taskData = JSON.parse(res.taskData);
      this.customerCif = res.customerId;
      this.bankID = res.bankId;
      this.getCustomerDetails(this.customerCif, this.bankID);
    });
  }

  getCustomerChannels(cif: string, bankID: string) {
    this.channelsService['getCustomerChannels'](bankID, cif)
      .subscribe((res: any) => {
        if (!res.successful) {
          if (res.statusCode === '99') {
            this.channelsService['getCustomerChannels'](
                this.bankID,
                this.customerDetails?.phoneNumber1
              )
              .subscribe((res: any) => {
                if (res.statusCode !== '99') {
                  this.channels = res.responseObject.channels;
                }
              });
          }
        } else {
          this.channels = res.responseObject.channels;
        }
      });
  }

  ngOnDestroy() {
    localStorage.removeItem('accMgntObj');
  }
}
