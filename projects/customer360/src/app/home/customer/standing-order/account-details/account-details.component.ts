import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AccountService } from '@app/core/services/account/account.service';
import { SessionService } from '@shared/services';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MaritalStatusPipe } from '@app/shared/pipes/marital-status.pipe';
import { ISubsidiary } from '@app/shared/services/session/session.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    TranslatePipe,
    DecimalPipe,
    MaritalStatusPipe,
  ],
})
export class AccountDetailsComponent implements OnInit, OnChanges {
  @Input() accountNumber!: any;
  @Input() customerId!: any;
  @Input() cifDetails!: any;
  @Input() accDetails!: any;
  @Input() isEntity!: boolean;
  public customerPhoto: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  customerPhotos!: any;
  accountDetails!: any;
  accountInfo: any;
  subsidiary!: ISubsidiary;
  idDetails: any;

  constructor(
    private domSanitizer: DomSanitizer,
    private session: SessionService,
    private accService: AccountService,
  ) {}

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.subsidiary = this.session.subsidiary;
    if (changes['accountNumber']?.currentValue) {
      this.accountNumber = changes['accountNumber'].currentValue;
      this.setup();
    }
    if (changes['customerId']) {
      this.customerId = changes['customerId']?.currentValue;
    }
    if (changes['cifDetails']?.currentValue) {
      this.cifDetails = changes['cifDetails']?.currentValue;
    }
  }

  private setup(): void {
    let uriString = `?Id=${this.accountNumber}&bankId=${this.session.user.bankId}&idType=accountid`;
    this.accService.getAccount(uriString).subscribe((resp: any) => {
      let isEntity: boolean;
      this.accDetails = resp.responseObject;
      this.accountInfo = resp.responseObject.accounts[0];
      isEntity = resp.responseObject.identifications.find(
        (identification: any) =>
          identification.type === 'CompRegNo' && identification.id !== ''
      );
    });
  }

  mapImages = (images: any, accNo: any) => {
    let photos: any;
    let imageList = images.filter((v: any) => v.acctIdField === accNo);
    if (imageList.length > 0) {
      photos = imageList.map((v: any) => {
        return {
          photo: this.domSanitizer.bypassSecurityTrustUrl(
            'data:image/jpeg;base64,' + v?.returnedPhotographFiels
          ),
          signaturePhoto: this.domSanitizer.bypassSecurityTrustUrl(
            'data:image/jpeg;base64,' + v?.returnedSignatureField
          ),
        };
      });
    } else if (imageList.length === 0) {
      photos = [
        {
          photo: this.customerPhoto,
          signaturePhoto: this.customerSignature,
        },
      ];
    }
    this.customerPhotos = photos;
  };

  displayImageModal = (source: any) => {
    // TODO: Add ImagePreviewDialog when shared/dialogs is migrated
  };
}
