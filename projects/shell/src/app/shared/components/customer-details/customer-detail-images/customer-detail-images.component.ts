import { Component, OnChanges, OnInit, SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { AccountManagementService, AccountService } from '@app/core/services';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { CustomerImagesPreviewModalComponent } from '../customer-images-preview-modal/customer-images-preview-modal.component';

@Component({
  selector: 'app-customer-detail-images',
  templateUrl: './customer-detail-images.component.html',
  styleUrls: ['./customer-detail-images.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class CustomerDetailImagesComponent implements OnInit, OnChanges {
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
    const customer: any = JSON.parse(
      <string>localStorage.getItem('accMgntObj')
    );
    this.fetchCustomerImages(customer);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['acc'].currentValue) {
      let accNumber: any = changes['acc'].currentValue;
      return this.fetchCustomerImagesSecondCall(accNumber);
    }
  }

  fetchCustomerImagesSecondCall = (val: any) => {
    const customer = this.accountManagementService['getCustomer']();
    this.accountService['fetchPhoto'](
        {
          customerId: customer?.cif,
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
    } else if (images.length === 0) {
      this.customerPhotos = null;
    }
  };

  displayImageModal = (source: any) => {
    const dialogRef = this.dialog.open(CustomerImagesPreviewModalComponent, {
      width: '600px',
    });

    dialogRef.componentInstance.imageSource = source;
  };

  fetchCustomerImages = (customer: any) => {
    this.accountService['fetchPhoto'](
        {
          customerId: customer?.cif,
          accountid: customer?.accountsId,
        },
        'v1'
      )
      .subscribe(
        (result: any) => {
          if (!result.successful) {
            this.toastService.show(
              result.statusMessage,
              'Error',
              MessageBoxType.DANGER
            );
            return;
          }
          const images = result.responseObject;
        this.accountManagementService['setCustomerImages'](images);
          this.mapImages([images[0]]);
        },
        (error: any) => {
          this.toastService.show(
            error,
            'Error',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        }
      );
  };
}
