import { Component, Input, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { TranslateService } from '@ngx-translate/core';
import { from, Subject } from 'rxjs';
import { map, mergeMap, takeUntil } from 'rxjs/operators';
import { AccountManagementService } from '@app/core/services/account-management/account-management.service';
import { AccountService } from '@app/core/services/account/account.service';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
import { ApiService } from '@app/shared/services/api.service';
import { ImagePreviewModalComponent } from '../../image-preview-modal/image-preview-modal.component';

export interface SupportDocuments {
  id: string;
  filename: string;
  uploadDate: string;
}

@Component({
  selector: 'app-customer-image',
  templateUrl: './customer-image.component.html',
  styleUrls: ['./customer-image.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class CustomerImageComponent implements OnInit, OnDestroy {
  @Input() acc: any;
  @Input() customerDetails: any;
  @Input() customerStatus!: string;
  @Input() justImages = false;
  @Input() supportDocuments!: SupportDocuments[];

  minusMarginTop = true;
  public customerPhoto: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-potrait.svg';
  public customerPhotos: any;
  public customerPhoto2: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature2: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';

  private destroy$ = new Subject<any>();

  constructor(
    translateService: TranslateService,
    private accountManagementService: AccountManagementService,
    private accountService: AccountService,
    private toastService: ToastService,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    const customer = this.accountManagementService['getCustomer']();
    this.customerDetails = this.accountManagementService['getCustomerDetails']();
    let acc = this.accountManagementService['getCustomerAccounts']();

    // filter an account with scheme type = SBA, and active
    let accId = acc
      .filter(
        (x: any) =>
          (x.schemeType === 'SBA' || x.schemeType === 'CAA') &&
          x.accountStatus === 'A' &&
          x.mandate === 'SELF'
      )
      .reverse()
      .pop();

    if (this.supportDocuments && this.supportDocuments.length !== 0) {
      this.setDocuments();
    } else {
      this.fetchCustomerImages(customer, accId);
    }
  }

  mapImages = (images: any) => {
    if (images.length > 0) {
      this.customerPhotos = images.map((v: any) => {
        return {
          photo: v?.returnedPhotographFiels
            ? this.domSanitizer.bypassSecurityTrustUrl(
                'data:image/jpeg;base64,' + v?.returnedPhotographFiels
              )
            : this.domSanitizer.bypassSecurityTrustUrl(
                'data:image/jpeg;base64,' + v?.returnedSignatureField
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

  compareStrings(str1: string, str2: string) {
    const sortedStr1 = str1.split(' ').sort().join(' ');
    const sortedStr2 = str2.split(' ').sort().join(' ');
    return sortedStr1 === sortedStr2;
  }

  displayImageModal = (source: any) => {
    const dialogRef = this.dialog.open(ImagePreviewModalComponent, {
      width: '600px',
    });

    dialogRef.componentInstance.imageSource = source;
  };

  fetchCustomerImages = (customer: any, accId: any) => {
    if (customer && customer.cif) {
      this.accountService
        ['fetchPhoto'](
          {
            customerId: customer?.cif,
            accountid: accId?.accountNumber,
          },
          'v1'
        )
        .pipe(takeUntil(this.destroy$))
        .subscribe(
          (result: any) => {
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

            // filters the images of known-agents and individual owners of the accounts
            const filteredImages: any[] = images.filter(
              (x: any) =>
                this.compareStrings(
                  x.customerNameField.trim(),
                  accId.accountName.trim()
                ) ||
                x.remarksField.trim() === '' ||
                (x.customerNameField.trim() === '' &&
                  x.remarksField.trim() !== '')
            );

            this.mapImages([filteredImages[0]]);
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
    }
  };

  private setDocuments() {
    const _supportDocuments = this.supportDocuments?.filter(data =>
      ['photo', 'signature'].includes(data.filename)
    );

    this.customerPhotos = [];

    this.minusMarginTop = false;
    _supportDocuments?.forEach(doc => {
      if (doc.id)
        this.previewDocument(doc)
          .pipe()
          .subscribe((b64: any) => {
            const _data = { data: b64 };

            let key!: string;

            if (_data.data.filename.includes('photo')) {
              key = 'photo';
              //we need the photo at the beginning
              this.customerPhotos.unshift({
                [key]: _data.data.data,
              });
            } else if (_data.data.filename.includes('signature')) {
              key = 'signaturePhoto';
              this.customerPhotos.push({
                [key]: _data.data.data,
              });
            }
          });
    });
  }

  private previewDocument(
    obj: SupportDocuments,
    type: 'NewGen' | 'Blob' = 'Blob'
  ) {
    return this.api
      .postBlob('/v2/documents/download', {
        id: obj?.id?.toString(),
        service: type,
      })
      .pipe(
        mergeMap((stream: any) => {
          return from(
            new Promise((resolve, _) => {
              const isPDF =
                obj?.filename?.split('.')[1]?.toLowerCase() === 'pdf';
              const contentType = isPDF ? 'application/pdf' : 'octet/stream';
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(new Blob([stream], { type: contentType }));
            })
          );
        }),
        map(data => {
          return {
            data,
            filename: obj.filename,
          };
        }),
        takeUntil(this.destroy$)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
