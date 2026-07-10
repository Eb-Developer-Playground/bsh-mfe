import { Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { CommonCustomerImagePreviewModalComponent } from './customer-image-preview-modal/customer-image-preview-modal.component';

@Component({
  selector: 'app-legacy-customer-image',
  templateUrl: './customer-image.component.html',
  styleUrls: ['./customer-image.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class CommonCustomerImageComponent implements OnChanges, OnInit {
  @Input() acc: any;
  @Input() cif: any;
  public customerPhoto: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-potrait.svg';
  public customerPhotos: any;
  public customerPhoto2: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature2: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';

  constructor(
    private accountManagementService: AccountManagementService,
    private accountService: AccountService,
    private toastService: ToastService,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log(
      {
        acc: this.acc,
        cif: this.cif,
      },
      'Customer Image Component'
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['acc']?.currentValue) {
      let accNumber: any = changes['acc']?.currentValue;
      return this.fetchCustomerImagesSecondCall(accNumber);
    }
  }

  fetchCustomerImagesSecondCall = (val: any) => {
    this.accountService['fetchPhoto'](
        {
          customerId: this.cif,
          accountid: val,
        },
        'v1'
      )
      .subscribe((result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }
        const images = result.responseObject;
        this.accountManagementService['setCustomerImages'](images);
        this.mapImages([images[0]]);
      });
  };

  mapImages = (images: any) => {
    if (images.length > 0) {
      this.customerPhotos = images.map((v: any) => {
        return {
          photo: this.domSanitizer.bypassSecurityTrustUrl(
            'data:image/jpeg;base64,' + v?.returnedPhotographFiels
          ),
          signaturePhoto: this.domSanitizer.bypassSecurityTrustUrl(
            'data:image/jpeg;base64,' + v?.returnedSignatureField
          ),
        };
      });
      this.accountService['setCustomerImages'](this.customerPhotos);
    } else if (images.length === 0) {
      this.customerPhotos = null;
      this.accountService['setCustomerImages'](this.customerPhotos);
    }
  };

  displayImageModal = (source: any) => {
    const dialogRef = this.dialog.open(
      CommonCustomerImagePreviewModalComponent,
      {
        width: '600px',
      }
    );

    dialogRef.componentInstance.imageSource = source;
  };

  fetchCustomerImages = () => {
    this.accountService['fetchPhoto'](
        {
          customerId: this.cif,
          accountid: this.acc,
        },
        'v1'
      )
      .subscribe((result: any) => {
        if (!result.successful) {
          this.toastService.show(
            result.statusMessage,
            'Error',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }
        const images = result.responseObject;
        this.accountManagementService['setCustomerImages'](images);
        this.mapImages([images[0]]);
      });
  };
}
