import { Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AccountManagementService } from 'src/app/core/services/account-management/account-management.service';
import { AccountService } from 'src/app/core/services/account/account.service';
import { Account } from 'src/app/home/customer/change-of-signature/change-of-signature.model';
import { ImagePreviewModalComponent } from 'src/app/shared/components/customer-information/image-preview-modal/image-preview-modal.component';
import { ToastService, MessageBoxType } from 'src/app/shared/modules/toast';
import { MatDialog } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { ChangeMandateService } from 'src/app/core/services/change-mandate/change-mandate.service';
import { SessionService } from '@app/shared/services';

@Component({
  selector: 'app-change-of-signature-stakeholder-detail',
  templateUrl: './change-of-signature-stakeholder-detail.component.html',
  styleUrls: ['./change-of-signature-stakeholder-detail.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ChangeOfSignatureStakeholderDetailComponent
  implements OnInit, OnChanges
{
  @Input() accountNumber: any;
  @Input() account!: Account;
  @Input() jointAccount = false;
  @Input() readonly = false;
  @Output() customerPhotosChange = new EventEmitter<any>();
  @Output() selectedSignatureField = new EventEmitter<any>();
  public customerPhoto: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-potrait.svg';
  public customerPhotos: any;
  public customerPhoto2: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerSignature2: SafeResourceUrl | string =
    './assets/icons/icon-placeholder-darker.svg';
  public customerDetails: any;
  signatories: any;

  constructor(
    private accountManagementService: AccountManagementService,
    private accountService: AccountService,
    private toastService: ToastService,
    private domSanitizer: DomSanitizer,
    public dialog: MatDialog,
    private changeMandateService: ChangeMandateService,
    private cd: ChangeDetectorRef,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.customerDetails = this.accountManagementService['getCustomerDetails']();

    this.fetchCustomerImages();
  }
  private getSignatories(accountNumber: string) {
    const payload: {
      AccountId: string;
      BankId: string;
    } = {
      AccountId: accountNumber,
      BankId: this.sessionService.userBank,
    };

    this.accountService['getAccountSignatories'](payload).subscribe((data: any) => {
      this.signatories = data.responseObject.mandates;

      // Manually trigger change detection
      this.cd.detectChanges();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const selectedAccount = JSON.parse(
      <string>localStorage.getItem('selectedAccount')
    )?.accountNumber;
    this.fetchCustomerImages();
    this.getSignatories(selectedAccount);
  }

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
          signatureField: v?.signatureField,
          active: v?.isActive,
          expired: v?.isExpired,
          effectiveDate: v?.effectiveDateField,
          expiryDate: v?.expiryDateField,
        };
      });
    } else if (images.length === 0) {
      this.customerPhotos = null;
    }

    this.customerPhotosChange.emit(this.customerPhotos);
  };

  displayImageModal = (source: any) => {
    const dialogRef = this.dialog.open(ImagePreviewModalComponent, {
      width: '600px',
    });

    dialogRef.componentInstance.imageSource = source;
  };

  fetchCustomerImages() {
    if (this.customerDetails === undefined) {
      this.customerDetails = JSON.parse(
        <string>localStorage.getItem('customerDetails')
      );
    }

    const account = JSON.parse(<string>localStorage.getItem('selectedAccount'));
    this.accountService['fetchPhoto'](
        {
          customerId: this.customerDetails.cif,
          accountid: this.account.accountNumber,
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
        const images = result.responseObject.filter(
          (image: any) => image.acctIdField === this.account.accountNumber
        );

        this.accountManagementService['setCustomerImages'](images);
        this.mapImages(images);
      });
  }

  onMatRadioChange(change: MatRadioChange) {
    this.selectedSignatureField.emit(change.value);
  }
}
