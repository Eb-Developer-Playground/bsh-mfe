import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DocumentsService } from 'src/app/shared/services/document/document.service';
import { CdscAccountOpeningService } from 'src/app/core/services/cdsc-account-opening/cdsc-account-opening.service';
import { IBreadcrumbConfig } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { BreadcrumbNavigationComponent } from 'src/app/shared/components/breadcrumb-navigation/breadcrumb-navigation.component';
import { MessageBoxType, ToastService } from 'src/app/shared/modules/toast';
import { DocumentsUploadComponent } from 'src/app/shared/modules/upload-docs/documents-upload.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-documents-upload-page',
  templateUrl: './documents-upload-page.component.html',
  styleUrls: ['./documents-upload-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DocumentsUploadComponent,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
})
export class DocumentsUploadPageComponent implements OnInit, OnDestroy {
  public depositTypeParam!: string;
  public breadcrumbsConfig: Array<IBreadcrumbConfig> = [
    {
      label: 'Service portal',
      url: 'services',
      active: false,
    },
    {
      label: 'Customer 360°',
      url: 'services/customer-360',
      active: false,
    },
    {
      label: 'Save&Invest',
      url: 'services/customer-360/save-and-invest-profile',
      active: false,
    },
    {
      label: 'Upload Documents',
      active: true,
    },
  ];

  public routeParamsSubscription: any;

  public documentsConfig: Array<any> = [
    {
      documentName: 'Passport Photo',
      description: 'PassportPhoto',
      required: true,
    },
    {
      documentName: 'Signature Photo',
      description: 'SignaturePhoto',
      required: true,
    },
  ];

  public documents!: Array<any>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private documentsService: DocumentsService,
    private cdscAccountOpeningService: CdscAccountOpeningService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(
      params => (this.depositTypeParam = params['depositType'])
    );
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription.unsubscribe();
  }

  get isCDSCAccountOpeningState(): boolean {
    return this.depositTypeParam === 'cdsc-account-opening';
  }

  onDocumentsAttached = (documents: any) => (this.documents = documents);

  onSubmit = () => {
    let ticketId!: string;

    if (this.isCDSCAccountOpeningState)
      ticketId = this.cdscAccountOpeningService.getTicketId();

        const documents = this.documents.map((docs: any) => ({
            ...docs.document,
            filename: docs.documentName,
        }));
        documents.forEach((docs) => (docs.data = docs.data.split(',')[1]));
        const uploadObj = {
            Country: 'KE',
            ticketNumber: ticketId,
            Service: 'NewGen',
            documents: documents,
        };
        this.documentsService.upload(uploadObj).subscribe(
            (result) => {
                if (!result[0].successful) {
                    this.toastService.show(
                        result[0].statusMessage,
                        'Error',
                        MessageBoxType.DANGER,
                        5000, undefined, undefined, false
                    );
                    return;
                }
                if (this.isCDSCAccountOpeningState)
                    return this.submitCDSCDocuments();
                this.next();
            }
        );
    };

  submitCDSCDocuments = () => {
    this.cdscAccountOpeningService.submitDocumentsUpload(this.next);
  };

  next = () =>
    this.router.navigateByUrl(
      `services/customer-360/save-and-invest/success/${this.depositTypeParam}`
    );

  get cancelButtonDisabled(): boolean {
    return this.isCDSCAccountOpeningState;
  }
}
