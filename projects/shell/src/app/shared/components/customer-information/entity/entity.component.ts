import { Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { AuditService } from '@app/core/services/audit/audit.service';
import { ChannelsService } from '@app/core/services/channels/channels.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import {
  ApiService,
  SessionService,
  StaticDataService,
} from '@app/shared/services';
import { environment as env } from '@env/environment';
import {
  Channel,
  ChannelsResponse,
  CustomerLevel,
  CustomerProfileDetails,
} from '@app/home/customer/channels/channels.model';
import { Router } from '@angular/router';
import { SoftDeleteDialogComponent } from '../soft-delete-dialog/soft-delete-dialog.component';
import { Subject } from 'rxjs';
import { TransformAddressPipe } from 'src/app/shared/pipes/transform-adress.pipe';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-entity-information',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class EntityInformationComponent implements OnInit, OnDestroy {
  isBusiness: boolean = false;
  @Output() cifInquiryDetailsObj = new EventEmitter();
  panelOpenState = false;
  kraPin: any;
  cifInquiryObj: any;
  @Input() accountNumber = '';
  customerDetails: any;
  showBioCaptured = false;
  bankId!: string;
  customerId: any;
  profileFound = false;
  channels!: Channel[];
  canDisplayImage = false;
  customerInformation: any;
  customerLevels!: CustomerLevel[];
  isSwapBlocked = false;
  customerStatus!: string;
  types: any[] = [];
  type: any;
  blockedInformation: any;
  blockReason = '';
  displayChannels: Channel[] = [];
  physicalAddress!: string;
  searchLegal!: string;

  private destroy$ = new Subject<any>();

  constructor(
    translateService: TranslateService,
    private accountManagementService: AccountManagementService,
    private auditService: AuditService,
    private accountService: AccountService,
    private channelsService: ChannelsService,
    private toast: ToastService,
    private sessionService: SessionService,
    private dialog: MatDialog,
    private router: Router,
    private api: ApiService,
    private staticDataService: StaticDataService
  ) {}

  ngOnInit(): void {
    this.isBusiness = this.accountManagementService['getIsCustomerBusiness']();
    this.getTypes();
    let customer: any = localStorage.getItem('accMgntObj');

    customer = JSON.parse(customer);
    this.cifInquiryObj = this.accountManagementService['getCustomerCifData']();
    this.customerInformation = customer;
    this.customerDetails = this.accountManagementService['getCustomerDetails']();
    const bioCaptured: any = localStorage.getItem('show-bio-captured');
    this.customerId = customer?.cif;
    this.bankId = this.customerInformation.bankID;
    this.showBioCaptured = JSON.parse(bioCaptured);
    this.getCifInquiry();
    this.getCustomerChannels();
    this.canDisplayImage = this.sessionService.hasFeatureRole(
      'AccountManagement.ViewSignatureAndPhoto'
    );
    const channelsList: any = localStorage.getItem(<string>'channels');
    this.channels = JSON.parse(channelsList);
    this.displayChannels = JSON.parse(channelsList);
    this.getBlockedAccountInfo();

    this.staticDataService
      .getDropdownData()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        const customer = JSON.parse(
          <string>localStorage.getItem('customerCifData')
        );
        this.physicalAddress = new TransformAddressPipe().transform(
          customer.contactDetails.addresses,
          'PHYSICAL-ADDRESS',
          'PRIMARY',
          data
        );
      });

    this.searchLegal = this.cifInquiryObj?.companyDetails.searchLegal;
  }

  getTypes() {
    this.api
      .get<any>(`/v1/backoffice/entities/businessType`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: resp => {
          this.types = resp?.responseObject;
          this.type = this.types?.find(
            el =>
              el.businessId == this.cifInquiryObj?.companyDetails?.businessType
          )?.bType;
        },
        error: err => {},
      });
  }
  getMiddleName() {
    const firstName = this.customerDetails?.firstName;
    const fullName =
      this.customerDetails?.fullName || this.customerDetails?.lastName;
    const lastName = this.customerDetails?.lastName;

    const fullNameArray = fullName?.split(' ');
    if (lastName?.indexOf(' ') > 0) {
      const lastNameArray = lastName.split(' ');
      const newLastName = lastNameArray.pop();
      const middleName = lastNameArray.join();
      this.customerDetails.middleName = middleName;
      this.customerDetails.lastName = newLastName;
      return;
    }
    const middleName = fullNameArray?.filter(
      (name: string) => firstName !== name && lastName !== name
    );
    if (middleName) {
      this.customerDetails.middleName = middleName?.join();
    }
  }

  getCifInquiry = () => {
    const customer = this.accountManagementService['getCustomer']();
    const payload = {
      bankId: customer?.bankID,
      customerId: customer?.cif,
    };

    this.logAudit(
      'SearchCustomerCIFInquiry',
      'Fetch personal details from CIF',
      JSON.stringify(payload)
    );
    this.accountService['cifInquiryV2'](this.isBusiness, payload).subscribe(
      (res: any) => {
        if (res.statusCode !== '00' || !res.responseObject) {
          this.logAudit(
            'SearchCustomerCIFInquiryFailed',
            'Fetch personal details from CIF',
            JSON.stringify(res)
          );
          return;
        }
        this.logAudit(
          'SearchCustomerCIFInquirySuccess',
          'Fetch personal details from CIF',
          JSON.stringify(res)
        );

        const cifInquiryObj: any = res.responseObject;
        this.cifInquiryDetailsObj.emit(res.responseObject);

        this.kraPin = this.isBusiness
          ? cifInquiryObj.companyDetails?.krapInNumber
          : cifInquiryObj.personalDetails?.krapInNumber;
      },
      (err: any) => {
        this.logAudit(
          'SearchCustomerCIFInquiryFailed',
          'Fetch personal details from CIF',
          JSON.stringify(err)
        );
      }
    );
  };

  logAudit = (EventName: any, EventDescription: any, AuditData: any) => {
    const log = {
      EventName,
      EventDescription,
      AuditData,
    };
    this.auditService['auditLog'](log, true).subscribe(
      (_res: any) => {},
      (_err: any) => {}
    );
  };

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

  getCustomerChannels() {
    this.channelsService
      ['getCustomerChannels'](this.bankId, this.customerId)
      .subscribe((res: ChannelsResponse) => {
        if (!res.successful) {
          if (res.statusCode === '99') {
            this.channelsService['getCustomerChannels'](this.bankId, this.preferredPhoneNumber)
              .subscribe((res: ChannelsResponse) => {
                if (res.statusCode !== '99') {
                  this.profileFound = true;
                  this.customerStatus = res.responseObject.status;
                  this.updateChannels(res.responseObject.channels);
                  localStorage.setItem(
                    'customerProfileStatus',
                    JSON.stringify(this.customerStatus)
                  );
                } else {
                  this.toast.show(
                    res.statusMessage,
                    '',
                    MessageBoxType.DANGER,
                    5000,
                    undefined,
                    undefined,
                    false
                  );
                }
              });
          }
        } else {
          this.profileFound = true;
          this.customerStatus = res.responseObject.status;
          this.updateChannels(res.responseObject.channels);
          localStorage.setItem(
            'customerProfileStatus',
            JSON.stringify(this.customerStatus)
          );
        }
      });
  }

  updateChannels(channelsResponse: Channel[]) {
    const mobileWOSubChannel: any[] = channelsResponse.filter(
      (el: any) => el.channel === 'Mobile' && !el.subChannel
    );
    this.channels?.forEach((channel: Channel) => {
      channelsResponse.forEach((newChannel: Channel) => {
        if (
          newChannel.channel === channel.channel &&
          newChannel.channel === 'Mobile'
        ) {
          if (newChannel.subChannel === channel.subChannel) {
            channel.subChannel = newChannel.subChannel;
            channel.status = newChannel.status;
            channel.blockReason = newChannel.blockReason;
            channel.createdDate = newChannel.createdDate;
          }
        } else if (newChannel && newChannel.channel === channel.channel) {
          channel.status = newChannel.status;
          channel.blockReason = newChannel.blockReason;
          channel.createdDate = newChannel.createdDate;
        }
      });
    });
    mobileWOSubChannel?.map((el: any) => {
      const newChannel = {
        channel: el.channel,
        status: el.status,
        createdDate: el.createdDate,
        blockReason: el.blockReason,
        subChannel: el.subChannel,
        level: -1,
      };
      this.channels.push(newChannel);
    });
    this.getProfileDetails();
  }

  getProfileDetails() {
    this.accountService['getAccDetails'](
      this.customerId,
      this.customerInformation.accountsId,
      this.preferredPhoneNumber,
      true
    )
      .subscribe((res: CustomerProfileDetails) => {
        this.customerLevels = res.customerLevels;
        this.isSwapBlocked = res.isSwapBlocked;
        this.customerLevels?.forEach((level: CustomerLevel) => {
          this.channels.forEach((channel: Channel) => {
            if (
              channel.channel === 'Mobile' &&
              channel.subChannel === level.subChannel
            ) {
              channel.level = level.level;
            } else if (
              channel.channel !== 'Mobile' &&
              channel.channel === level.channel
            ) {
              channel.level = level.level;
            } else if (
              channel.channel === 'Mobile' &&
              level.channel === 'Mobile' &&
              !channel.subChannel
            ) {
              channel.level = level.level;
            }
          });
        });
        this.displayChannels = this.setDisplayChannels(this.channels);
        localStorage.setItem(
          'displayChannels',
          JSON.stringify(this.setDisplayChannels(this.channels))
        );
        const validChannels = this.channels.filter(
          (el: any) => !(el.channel === 'Mobile' && !el.subChannel)
        );
        localStorage.setItem('channels', JSON.stringify(validChannels));
      });
  }

  // count 2?
  // && inactive? return 1; (every)
  // && 1 woSub? it's sub is the sub of the other mobile everything else is the same
  // count > 2?
  // && woSub.length? display just those woSub
  // else all
  setDisplayChannels(channels: any[]) {
    const nonMobile = channels.filter((el: any) => el.channel !== 'Mobile');
    const mobileChannels =
      channels?.filter((el: any) => el.channel === 'Mobile') ?? [];
    const mobileWOSub =
      channels?.filter(
        (el: any) => el.channel === 'Mobile' && !el.subChannel
      ) ?? [];
    const mobileWSub =
      channels?.filter((el: any) => el.channel === 'Mobile' && el.subChannel) ??
      [];
    if (
      mobileChannels.length === 2 &&
      mobileChannels.every((el: any) => el.status === 'InActive')
    )
      return [
        ...nonMobile,
        {
          channel: 'Mobile',
          status: 'InActive',
          createdDate: '',
          blockReason: '',
          subChannel: '',
          level: -1,
          id: 'none',
        },
      ];
    else if (mobileChannels.length === 2 && mobileWOSub?.length === 1) {
      return [
        ...nonMobile,
        {
          channel: 'Mobile',
          status: mobileWOSub[0].status,
          createdDate: mobileWOSub[0].createdDate,
          blockReason: mobileWOSub[0].blockReason,
          subChannel:
            mobileWSub[0].subChannel === 'Android' ? 'iOS' : 'Android',
          level: mobileWOSub[0].level,
          id:
            mobileWSub[0].id === 'mobile-Android'
              ? 'mobile-iOS'
              : 'mobile-Android',
        },
      ];
    } else if (mobileChannels.length > 2 && mobileWOSub) {
      return [...nonMobile, ...mobileWOSub];
    }
    return channels;
  }

  updateProfile() {
    const accounts: any[] = (
      JSON.parse(<string>localStorage.getItem('accounts')) || []
    )
      .map((ac: any) => {
        return {
          ...ac,
          accountOpeningDate: new Date(ac.accountOpeningDate),
        };
      })
      .sort(
        (a: any, b: any) =>
          a.accountOpeningDate.getTime() - b.accountOpeningDate.getTime()
      );
    let isEntity = this.accountManagementService['isBusiness'];
    if (isEntity && !accounts.length) {
      this.toast.show(
        null,
        'No account found. An account is required to authorize CIF update',
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }
    let account = this.accountManagementService['getCustomer']();
    let customer = isEntity ? 'entity' : 'individual';
    let url = new URL(env.customerOnboardingUrl);
    let params = url.searchParams;
    params.set('customerId', account.cif);
    params.set('accountId', account.accountsId);
    url.pathname = `/services/static-data/ke/${customer}`;
    url.search = params.toString();
    this.sessionService.routeToUrl(url);
  }

  goToSearch() {
    if (this.customerStatus === 'InActive') {
      this.dialog.open(SoftDeleteDialogComponent, {
        width: '520px',
      });
    } else {
      this.router.navigateByUrl('/services/omnichannel-profile');
    }
  }
  getBlockedAccountInfo = () => {
    this.accountService['getCustomerStatistics'](this.customerId, true).subscribe(
      (res: any) => {
        if (res.successful && res.responseObject.length > 0) {
          this.blockedInformation = res.responseObject[0];
          const taskData = JSON.parse(res.responseObject[0].taskData);
          this.blockReason = taskData.Comment;
        }
      },
      (_error: any) => {}
    );
  };

  canAccessSoftDelete() {
    return this.sessionService.hasRole('SoftDelete.Maker');
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
