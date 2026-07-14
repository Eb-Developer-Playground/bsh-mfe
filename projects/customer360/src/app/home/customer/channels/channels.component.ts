import { Component, OnInit } from '@angular/core';
import { AccountManagementService } from '@app/core/services';
import { ChannelCommentDialogComponent } from './channel-comment-dialog/channel-comment-dialog.component';
import {
  AccChannels,
  Channel,
  CustomerLevel,
  CustomerProfileData,
} from './channels.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ChannelsService } from '@app/core/services/channels/channels.service';
import { CHANNEL_LIST } from '@shared/utils/constants';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ChannelsListComponent } from './channels-list/channels-list.component';
import { ChannelDetailComponent } from './channel-detail/channel-detail.component';
import { EquitelSTKDetailComponent } from './equitel-stk-detail/equitel-stk-detail.component';
import { UpcomingScheldulePaymentComponent } from './upcoming-scheldule-payment/upcoming-scheldule-payment.component';
import { ChannelTransactionsComponent } from './channel-activities/channel-transactions/channel-transactions.component';
import { SigninChannelActivityComponent } from './channel-activities/signin-channel-activity/signin-channel-activity.component';

@Component({
  selector: 'app-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss'],
  imports: [
    MatCardModule,
    MatDividerModule,
    MatButtonModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    ChannelsListComponent,
    ChannelDetailComponent,
    EquitelSTKDetailComponent,
    UpcomingScheldulePaymentComponent,
    ChannelTransactionsComponent,
    SigninChannelActivityComponent,
  ],
})
export class ChannelsComponent implements OnInit {
  channelsActivitiesBtn = [
    // {
    //     text:'All',
    //     link:'all',
    // },
    {
      text: 'Sign-ins',
      link: 'sign-ins',
    },
    {
      text: 'Transactions',
      link: 'transactions',
    },
    {
      text: 'Software updates',
      link: 'software-updates',
    },
    {
      text: 'Service requests',
      link: 'service-requests',
    },
  ];

  channelsActivitiesCtrl = new FormControl('transactions');
  bankId!: string;
  customerId!: string;
  customerDetails!: any;
  channels: Channel[] | [] = [];
  accountChannels: AccChannels[] | [] = [
    {
      channel: {
        channel: 'Web',
        subChannel: '',
      },
    },
    {
      channel: {
        channel: 'Mobile',
        subChannel: 'Android',
      },
    },
    {
      channel: {
        channel: 'Mobile',
        subChannel: 'iOS',
      },
    },
    {
      channel: {
        channel: 'USSD',
        subChannel: '',
      },
    },
    {
      channel: {
        channel: 'Chatbot',
        subChannel: '',
      },
    },
  ];
  cifInquiryObj!: any;
  profileFound = false;
  customerStatus: any = '';
  customerInfo: any;
  customerLevels!: CustomerLevel[];
  isSwapBlocked = false;
  selectedChannel: any;
  equitelData: any;

  constructor(
    private accountManagementService: AccountManagementService,
    private channelsService: ChannelsService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    let customer: any = localStorage.getItem('accMgntObj');
    this.customerInfo = JSON.parse(<string>localStorage.getItem('accMgntObj'));
    this.customerStatus = JSON.parse(
      <string>localStorage.getItem('customerProfileStatus')
    );
    let channelsList: any = localStorage.getItem(<string>'displayChannels');
    this.channels = JSON.parse(channelsList);
    customer = JSON.parse(customer);
    this.bankId = customer.bankID;
    this.customerId = customer.cif;
    this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
    this.customerDetails = this.accountManagementService.getCustomerDetails();
    this.fetchChannels();
    this.setDefault(this.accountChannels);
  }

  fetchChannels() {
    this.channelsService.getChannels(this.customerId, 'CustomerId').subscribe(
      (response: any) => {
        if (response.statusCode === '00') {
          this.accountChannels = response.responseObject.length > 0 ?  response.responseObject : CHANNEL_LIST;
        }
      },
      _err => {
        this.channelsService
          .getChannels(this.preferredPhoneNumber, 'PhoneNumber')
          .subscribe((response: any) => {
            if (response.statusCode === '00')
              this.accountChannels = response.responseObject.length > 0 ? response.responseObject : CHANNEL_LIST;
          });
      }
    );
    this.setDefault(this.accountChannels);
  }

  setDefault(channels: any[]) {
    if (channels && channels[0]) {
      localStorage.setItem(
        'activeChannel',
        JSON.stringify(channels[0].channel)
      );
    }
  }

  get preferredPhoneNumber(): any {
    const phoneNumbers = this.cifInquiryObj.contactDetails?.phoneNumbers || [];
    const preferredPhoneNumberObj = phoneNumbers.find(
      (phoneNumber: any) => !!phoneNumber.preferred
    );

    let preferredPhoneNumber;
    if (
      !preferredPhoneNumberObj?.countryCode &&
      !preferredPhoneNumberObj?.cityCode
    ) {
      preferredPhoneNumber = preferredPhoneNumberObj?.number;
    } else if (!preferredPhoneNumberObj?.countryCode) {
      preferredPhoneNumber =
        preferredPhoneNumberObj?.cityCode + preferredPhoneNumberObj?.number;
    } else if (!preferredPhoneNumberObj?.cityCode) {
      preferredPhoneNumber =
        preferredPhoneNumberObj?.countryCode + preferredPhoneNumberObj?.number;
    } else {
      preferredPhoneNumber =
        preferredPhoneNumberObj?.countryCode +
        preferredPhoneNumberObj?.cityCode +
        preferredPhoneNumberObj?.number;
    }
    return preferredPhoneNumber;
  }

  onCustomerAction(action: string) {
    const data: CustomerProfileData = {
      actionName: action,
      comment: '',
      customerId: this.customerDetails.cif,
      phoneNumber: this.preferredPhoneNumber,
      level: 1,
      action: action,
    };

    if (
      data.actionName === 'ChangeProfileLevel' ||
      data.actionName === 'UnblockChannel'
    ) {
      // data.channel = this.selectedChannel.channel;
      // data.subChannel = this.selectedChannel.subChannel;
      data.channel = this.selectedChannel.channel.channel;
      data.subChannel = this.selectedChannel.channel.subChannel;
    }

    const dialogRef = this.dialog.open(ChannelCommentDialogComponent, {
      width: '520px',
      data: data,
    });
    dialogRef.afterClosed().subscribe(selectedAccount => {});
  }

  onSelectedChannel(event: any) {
    this.selectedChannel = event;
    localStorage.setItem('activeChannel', JSON.stringify(event));
  }

  onOpenedBSS(event: any) {
    this.equitelData = event;
  }
}
