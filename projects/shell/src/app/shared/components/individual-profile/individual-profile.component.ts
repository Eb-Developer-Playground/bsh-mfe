import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { AccountService } from '@app/core/services';
import { PhotoSignatureReuseComponent } from '@app/home/customer/additional-account/photo-signature-reuse/photo-signature-reuse.component';
import {
  Account,
  ISignature,
  SelectedDataItem,
  Stakeholder,
} from '@app/shared/models/customer/shared';
import { MessageBoxType } from '@app/shared/modules/toast/models';
import { ToastService } from '@app/shared/modules/toast/toast.service';
import {
  IDocumentSpec,
  IUploadedDocument,
} from '@app/shared/modules/upload-docs';
import { DocumentsUploadModuleDrc } from '@app/shared/modules/upload-docs/documents-upload-drc/documents-upload-drc.module';
import { ISubsidiary } from '@app/version-2/shared/services/session-v2/session.service';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from './header/header.component';
import { PhotoSignatureComponent } from './photo-signature/photo-signature.component';
import { PrimaryDetailsComponent } from './primary-details/primary-details.component';
import { ContextManager } from '@app/shared/modules/stepper';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-individual-profile',
  standalone: true,
  imports: [
    MatCard,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatDividerModule,
    MatExpansionPanelHeader,
    TranslateModule,
    CommonModule,
    HeaderComponent,
    PrimaryDetailsComponent,
    PhotoSignatureComponent,
    PhotoSignatureReuseComponent,
    DocumentsUploadModuleDrc,
  ],
  templateUrl: './individual-profile.component.html',
  styleUrl: './individual-profile.component.scss',
})
export class IndividualProfileComponent implements OnInit {
  destroy$: Subject<any> = new Subject<any>();
  @Input() subsidiary!: ISubsidiary;
  @Input() stakeholderlDetails!: Stakeholder;
  @Input() subTitle: string = 'Director';
  signatureAndPhoto!: ISignature[];
  @Input() expanded: boolean = true;
  @Input() isReviewStep!: boolean;
  @Input() showMoreInfo!: boolean;
  @Input() expandedHeight: string = '64px';
  @Input() collapsedHeight: string = '64px';
  fullName: string = 'XYZ';
  @Input() showSignatures: boolean = true;
  @Input() isMinorFlow: boolean = false;
  @Input() showAccountDetails = true;
  @Input() showAccountImagesAndSignatures: boolean = true;
  @Input() showUploadDocs!: boolean;
  @Output() isStep2ValidChange = new EventEmitter<boolean>();
  @Output() uploadedDocsByCif = new EventEmitter<{
    [cif: string]: IUploadedDocument[];
  }>();
  photoReuse: any;
  signatuReuse: any;
  accountList: Account[] = [];
  reusePhotoSignature: Boolean = false;
  uploadedDocs: IUploadedDocument[] = [];
  UploadDocuments: IDocumentSpec[] = [
    {
      name: 'Passport',
      description: 'PassportPhoto',
      fileTypes: ['image/png', 'image/jpeg'],
      maxSize: 100 * 1024, // 100Kbs
      required: true,
      docCode: '079',
    },
    {
      name: 'Signature',
      description: 'SignaturePhoto',
      fileTypes: ['image/png', 'image/jpeg'],
      maxSize: 100 * 1024, // 100Kbs
      required: true,
      docCode: '085',
    },
  ];

  constructor(
    private accountService: AccountService,
    private toastService: ToastService,
    private ctxManager: ContextManager,
    private changeDetector: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.isReviewStep) {
      this.fetchDetailsByCif();
    } else {
      this.signatureAndPhoto = this.getSignatureAndPhoto();
    }
  }

  ngOnChanges(): void {
    if (this.stakeholderlDetails) {
      const { firstName, middleName, lastName } = this.stakeholderlDetails;
      this.fullName = [firstName, middleName, lastName]
        .filter(Boolean)
        .join(' ');
    }
  }

  onReuseToggle(value: boolean) {
    this.reusePhotoSignature = value;
  }

  handleApply(selectedData: SelectedDataItem[]): void {
    selectedData.forEach(item => {
      if (item.name === 'Passport') {
        this.photoReuse = { name: item.name, data: item.data };
      }

      if (item.name === 'Signature') {
        this.signatuReuse = { name: item.name, data: item.data };
      }
    });

    this.changeDetector.detectChanges();
  }

  updateDocuments(docs: IUploadedDocument[]) {
    this.uploadedDocs = docs;
    if (
      this.uploadedDocs
        .filter(doc => doc.required && !doc.success)
        .every(d => d.file)
    ) {
      // this.stepControl?.patchValue(true);
      this.isStep2ValidChange.emit(true);
      const uploadedDocsAndCif = {
        [this.stakeholderlDetails.cif || '']: docs,
      };
      this.uploadedDocsByCif.emit(uploadedDocsAndCif);
    } else {
      //  this.stepControl?.patchValue(null);
      this.isStep2ValidChange.emit(false);
    }

    // this.stepControl.patchValue(
    //     docs.every(d => d.required && d.document) ? true : null
    // );
  }

  fetchDetailsByCif = (): void => {
    const cif = this.stakeholderlDetails?.cif;
    if (!cif) {
      this.toastService.show(
        'Missing CIF',
        'Customer ID is required.',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }
    const currentUserBankId = this.subsidiary.bankId;
    const queryParams = `?Id=${cif}&bankId=${currentUserBankId}&idType=customerid&reloadFromCache=false`;

    this.accountService
      .getAccount(queryParams, true)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const accountNumber =
            response.responseObject?.accounts?.[0]?.accountNumber;
          const payload = { customerId: cif, accountid: accountNumber };
          this.onAccountSelect(payload);

          const accounts = response.responseObject?.accounts || [];

          this.accountList = accounts.map((acc: any) => ({
            accountName: acc.accountName,
            accountNumber: acc.accountNumber,
            cif: response.responseObject?.cif,
            accountCurrency: acc.accountCurrency,
            accountStatus: acc.accountStatus,
          }));
        },
        error: (error: any) => {},
      });
  };

  onAccountSelect(payload: { customerId: string; accountid: string }): void {
    this.accountService
      .fetchPhoto(payload, 'v1', {
        headers: { skipLoadingInterceptor: String(false) },
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.statusCode === '00') {
            this.toastService.show(
              'Success',
              'Stakeholder photos fetched successfully!',
              MessageBoxType.SUCCESS,
              5000,
              undefined,
              undefined,
              false
            );

            this.signatureAndPhoto = response.responseObject.map(
              (item: any) => ({
                passport: this.getImageUrl(item?.returnedPhotographFiels),
                signature: this.getImageUrl(item?.returnedSignatureField),
              })
            );
            this.changeDetector.markForCheck();
          }
        },
        error: (error: any) => {
          this.toastService.show(
            null,
            error?.message ||
              'An unexpected error occurred while fetching stakeholder photos',
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            false
          );
        },
      });
  }

  getSignatureAndPhoto(): ISignature[] {
    const cif = this.stakeholderlDetails?.cif;
    const stakeholdersUploadedDocsByCif =
      this.ctxManager?.currentContextData?.stakeholdersUploadedDocsByCif;

    let filteredObj;
    if (stakeholdersUploadedDocsByCif) {
      filteredObj = stakeholdersUploadedDocsByCif.find((obj: any) =>
        obj.hasOwnProperty(cif)
      );
    } else {
      this.fetchDetailsByCif();
    }

    if (filteredObj) {
      for (const cif in filteredObj) {
        const docs = filteredObj[cif];
        let passportData = '';
        let signatureData = '';

        for (let i = 0; i < docs.length; i++) {
          const doc = docs[i];

          if (doc.name.toLowerCase().includes('passport')) {
            passportData = doc.document.data;
          } else if (doc.name.toLowerCase().includes('signature')) {
            signatureData = doc.document.data;
          }
        }
        return [
          {
            passport: this.getImageUrl(passportData.split(',')[1]),
            signature: this.getImageUrl(signatureData.split(',')[1]),
          },
        ];
      }
    }
    return [];
  }

  getImageUrl(base64Data: string): string {
    const binary = atob(base64Data);
    const array = [];

    for (let i = 0; i < binary.length; i++) {
      array.push(binary.charCodeAt(i));
    }

    const blob = new Blob([new Uint8Array(array)], { type: 'image/jpeg' });
    return URL.createObjectURL(blob);
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }
}
