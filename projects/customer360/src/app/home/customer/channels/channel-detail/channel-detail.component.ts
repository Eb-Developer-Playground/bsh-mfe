import {
    Component,
    Input, OnChanges,
    OnDestroy,
    OnInit,
    SimpleChanges,
} from '@angular/core';
import { AccountManagementService } from '@app/core/services';
import { ChannelCommentDialogComponent } from '../channel-comment-dialog/channel-comment-dialog.component';
import { AccChannels, Account } from '../channels.model';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-channel-detail',
  templateUrl: './channel-detail.component.html',
  styleUrls: ['./channel-detail.component.scss'],
  imports: [
    MatDividerModule,
    MatExpansionModule,
    MatIconModule,
    MatMenuModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    TranslatePipe,
    DatePipe,
  ],
})
export class ChannelDetailComponent implements OnInit, OnDestroy, OnChanges {
  @Input() selectedChannel!: AccChannels;
  // @Input() selectedChannel!: Channel;
  cifInquiryObj: any;
  customerDetails: any = JSON.parse(
    <string>localStorage.getItem('customerDetails')
  );
  firstName!: string;
  lastName!: string;
  accounts: any[] = JSON.parse(
    <string>localStorage.getItem('linkedProfileAccounts')
  );
  panelOpenState: boolean = true;
  phoneNumbers: PhoneNumber[] = [];
  linkedAccounts: any[] = JSON.parse(
    <string>localStorage.getItem('linkedProfileAccounts')
  );
  unLinkedAccounts: Account[] = [];
  customerAccounts: Account[] = JSON.parse(
    <string>localStorage.getItem('accounts')
  );

  destroy$: Subject<any> = new Subject<any>();
  linkedPayPalAccounts: any[] = JSON.parse(
    <string>localStorage.getItem('linkedPayPalAccounts')
  );

  channelSelected = JSON.parse(
    <string>localStorage.getItem('selectedAccChannel')
  );

  constructor(
    private dialog: MatDialog,
    private accountManagementService: AccountManagementService,
    public router: Router,
  ) {}

  ngOnInit(): void {
    this.cifInquiryObj = this.accountManagementService.getCustomerCifData();
    this.phoneNumbers = this.cifInquiryObj.contactDetails?.phoneNumbers;
    this.mutateLinkedProfileAccountsArr(
      this.channelSelected?.accountPermissions
    );
      console.log("permissions", this.channelSelected);
    this.getUnlinkedAccounts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedChannel'].currentValue) {
      this.selectedChannel = changes['selectedChannel'].currentValue;
      this.mutateLinkedProfileAccountsArr(
        this.selectedChannel?.accountPermissions
      );
    }
  }

  private mutateLinkedProfileAccountsArr(accountsArr: any) {
    this.linkedAccounts?.forEach(profileAccount => {
      const matchingAccount = accountsArr?.find(
        (linkedAccount: { account: { accountNumber: number } }) =>
          linkedAccount.account.accountNumber === profileAccount.accountNumber
      );
      if (matchingAccount) {
        profileAccount.canView = matchingAccount.canView;
        profileAccount.canTransact = matchingAccount.canTransact;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
  checkIfCanDelink(accountNumber: any) {
    const found = this.customerAccounts.find(
      (acc: any) => acc.accountNumber == accountNumber
    );
    if (found) {
      if (found.schemeType == 'LAA' || found.schemeType == 'ODA') return false;
      else return true;
    } else return true;
  }
  getUnlinkedAccounts(): void {
    const linked = this.linkedAccounts?.map((acc: Account) => acc.accountNumber);
    const accounts = this.customerAccounts.map(
      (acc: Account) => acc.accountNumber
    );
    const unlinked = accounts?.filter(
      (accNum: string) => !linked?.includes(accNum)
    );
    this.unLinkedAccounts = this.customerAccounts.filter((acc: Account) =>
      unlinked.includes(acc.accountNumber)
    );
    localStorage.setItem(
      'unLinkedProfileAccounts',
      JSON.stringify(this.unLinkedAccounts)
    );
  }

  get preferredPhoneNumber(): any {
    const phoneNumbers = this.cifInquiryObj.contactDetails?.phoneNumbers || [];
    const preferredPhoneNumberObj = phoneNumbers.find(
      (phoneNumber: PhoneNumber) => phoneNumber.preferred
    );
    const preferredPhoneNumber =
      preferredPhoneNumberObj?.countryCode +
      preferredPhoneNumberObj?.cityCode +
      preferredPhoneNumberObj?.number;
    return preferredPhoneNumber;
  }

  onRegisterChannel() {
      const data = {
      action: 'Register Channel',
      customerCategory: 'Level1',
      comment: '',
      productType: this.selectedChannel.channel.channel === "Mobile" ? this.selectedChannel.channel.subChannel : this.selectedChannel.channel.channel,
      customerId: this.customerDetails.cif,
      phoneNumber: this.preferredPhoneNumber,
    };

    const dialogRef = this.dialog.open(ChannelCommentDialogComponent, {
      width: '520px',
      data: data,
    });
  }

  viewScheduledPayments(account: any) {
    localStorage.setItem('scheduledPaymentsAccount', JSON.stringify(account));
    this.router.navigate([
      '/services/customer-360/channels/scheduled-payments',
    ]);
  }

  delinkAccount(account: any) {
    localStorage.setItem('delinkedAccount', JSON.stringify(account));
    this.router.navigate(['/services/customer-360/channels/delink-account']);
  }

  delinkPayPalAccount(account: any) {
    localStorage.setItem('delinkedPayPalAccount', JSON.stringify(account));
    this.router.navigate([
      '/services/customer-360/channels/delink-paypal-account',
    ]);
  }

  viewPayPalAccount(account: any) {
    localStorage.setItem('delinkedPayPalAccount', JSON.stringify(account));
    this.router.navigate([
      '/services/customer-360/channels/paypal-account-details',
    ]);
  }
}

interface PhoneNumber {
  cityCode: string;
  comment: string;
  countryCode: string;
  id: string;
  number: string;
  phoneType: string;
  preferred: boolean;
  toBeDeleted: boolean;
}
