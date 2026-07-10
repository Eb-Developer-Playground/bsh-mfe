import { ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MaritalStatusPipe } from '../../pipes/marital-status.pipe';
import { AccountService, SessionService } from '../../services';
import { MessageBoxType, ToastService } from '../toast';
import { ImagePreviewDialog } from '../../dialogs';
import { ISubsidiary } from '@app/shared/services/session/session.service';

@Component({
  selector: 'app-account-details',
  templateUrl: './account-details.component.html',
  styleUrls: ['./account-details.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatCardModule,
    MatIconModule,
    TranslatePipe,
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
    private dialog: MatDialog,
    private toast: ToastService,
    private cd: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private session: SessionService,
    private accService: AccountService
  ) {}

  ngOnInit(): void {
    // console.log(this.accountInfo?.mandate)
    // this.setup();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.subsidiary = this.session.subsidiary;
    if (changes?.['accountNumber']?.currentValue) {
      this.accountNumber = changes?.['accountNumber'].currentValue;
      this.setup();
    }
    if (changes?.['customerId']) {
      this.customerId = changes?.['customerId'].currentValue;
      this.performCIFInquiry(this.customerId, this.isEntity);
    }
    if (changes?.['cifDetails']?.currentValue) {
      this.cifDetails = changes?.['cifDetails']?.currentValue;
    }
  }

  private setup(): void {
    let uriString = `?Id=${this.accountNumber}&bankId=${this.session.user.bankId}&idType=accountid`;
    this.accService.getAccount(uriString).subscribe(resp => {
      let isEntity: boolean;
      this.accDetails = resp.responseObject;
      this.accountInfo = resp.responseObject.accounts[0];
      isEntity = resp.responseObject.identifications.find(
        (identification: any) =>
          identification.type === 'CompRegNo' && identification.id !== ''
      );
      this.fetchAccountPhotos(
        resp.responseObject.cif,
        this.accountNumber,
        isEntity
      );
    });
  }

  private fetchAccountPhotos(cif: any, accNo: any, isEntity = false) {
    this.accService
      .fetchPhoto({ CustomerId: cif, accountid: accNo })
      .subscribe(resp => {
        if (resp.statusCode === '00') {
          this.isEntity = isEntity;
          this.mapImages(resp.responseObject, accNo);
          this.performCIFInquiry(cif, this.isEntity);
        } else {
          this.toast.show(
            null,
            resp.statusMessage,
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      });
  }

  private performCIFInquiry(cif: any, isEntity: boolean): void {
    this.accService.cifInquiryV2(cif, isEntity).subscribe((res: any) => {
      if (res.successful) {
        this.cifDetails = isEntity
          ? res.responseObject.companyDetails
          : res.responseObject.personalDetails;
        this.idDetails = res.responseObject?.identificationDetails?.[0];
      }
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
    const dialogRef = this.dialog.open(ImagePreviewDialog, {
      width: '80%',
      height: '90%',
    });
    dialogRef.componentInstance.imageSource = source;
  };
}
