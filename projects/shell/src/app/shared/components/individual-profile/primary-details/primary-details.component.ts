import { CommonModule } from '@angular/common';
import { PipesModule } from '@app/shared/pipes/pipes.module';
import { Component,
 Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatCardContent, MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { AdditionalPersonalDetails } from '@app/shared/models/customer/individual-formstate';
import { ISignature, Stakeholder } from '@app/shared/models/customer/shared';
import { DocumentsUploadModule } from '@app/shared/modules/upload-docs';
import { DocumentsUploadModuleDrc } from '@app/shared/modules/upload-docs/documents-upload-drc/documents-upload-drc.module';
import { getLanguageLabel } from '@app/shared/utils/utils';
import { GenderPipe } from '@app/shared/pipes/gender.pipe';
import { ISubsidiary } from '@app/shared/services/session/session.service';
import { TranslatePipe } from '@ngx-translate/core';
import { MaritalStatusPipe } from '@app/shared/pipes/marital-status.pipe';
import { ImagePreviewModalComponent } from '../../customer-information/image-preview-modal/image-preview-modal.component';
@Component({
  selector: 'app-primary-details',
  templateUrl: './primary-details.component.html',
  styleUrl: './primary-details.component.scss',
  imports: [
    COMPAT_IMPORTS,
    MatCardContent,
    MatIconModule,
    CommonModule,
    MatCardModule,
    TranslatePipe,
    MatDividerModule,
    DocumentsUploadModuleDrc,
    DocumentsUploadModule,
    PipesModule,
    GenderPipe,
    MaritalStatusPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class PrimaryDetailsComponent implements OnInit {
  @Input() subsidiary!: ISubsidiary;
  @Input() signatureAndPhoto: ISignature[] = [];
  @Input() showAccountDetails = true;
  @Input() showAccountImagesAndSignatures: boolean = true;
  @Input() additionalPersonalDetails?: AdditionalPersonalDetails;
  @Input() stakeholderlDetails!: Stakeholder;
  taxIdLabel: string = 'FORMS.PERSONAL_DETAILS.LABELS.TAX_ID';

  constructor(private dialog: MatDialog) {}

  ngOnInit(): void {}

  displayImageModal = (source: any) => {
    const dialogRef = this.dialog.open(ImagePreviewModalComponent, {
      width: '600px',
    });
    dialogRef.componentInstance.imageSource = source;
  };

  getLanguageLabel = (language: string): string => {
    return getLanguageLabel(language);
  };
}
