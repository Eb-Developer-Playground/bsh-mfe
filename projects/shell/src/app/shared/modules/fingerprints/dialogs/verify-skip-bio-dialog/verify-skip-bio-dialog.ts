import { Component, Inject, OnDestroy, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MessageBoxType, ToastService } from '../../../toast';
import { ApiService, SessionService } from '../../../../services';
import { BioVerifyInput } from '../../models';

import { isDevOrUat } from '../../../../utils';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../../compat-barrel';
import { TransformProfileActionPipe } from '../../pipes/transform-profile-action.pipe';

export enum reasonOption {
  CUSTOMER_NOT_PRESENT = 'customerNotPresent',
  CONTACT_CENTER = 'contactCenter',
  DIGITAL_SUPPORT = 'digitalSupport',
}

@Component({
  selector: 'app-verify-skip-bio',
  templateUrl: './verify-skip-bio-dialog.html',
  styleUrls: ['./verify-skip-bio-dialog.scss'],
  imports: [COMPAT_IMPORTS, TransformProfileActionPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class VerifySkipBioDialog implements OnInit, OnDestroy {
  reasonOptionSelected!: reasonOption;
  reasonForm!: UntypedFormGroup;
  actionsArray: string[] = [];
  reasonOptionArray: any[] = [];
  requiredUploadDocument = true;
  allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf'];
  size: any;
  unit: any;
  accountData: any;
  _truncatedSize: any;
  cloneOfObjects: Array<any> = [];
  destroy$ = new Subject();

  constructor(
    public dialogRef: MatDialogRef<VerifySkipBioDialog>,
    @Inject(MAT_DIALOG_DATA) public data: BioVerifyInput,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private api: ApiService,
    private toast: ToastService,
    private sessionService: SessionService
  ) {
    this.reasonForm = this.formBuilder.group({
      reason: ['', Validators.required],
      comment: ['', Validators.required],
      action: [''],
    });
    if (isDevOrUat()) {
      if (this.sessionService.userWorkClass === '080') {
        this.reasonOptionArray = [
          {
            code: reasonOption.CONTACT_CENTER,
            title: 'Contact Center',
            description: '',
          },
          {
            code: reasonOption.DIGITAL_SUPPORT,
            title: 'Digital Support',
            description: '',
          },
          {
            code: reasonOption.CUSTOMER_NOT_PRESENT,
            title: 'Customer Not Present',
            description: '',
          },
        ];
      } else {
        if (this.isFeatureAccessibleForContactCenter()) {
          this.reasonOptionArray = [
            {
              code: reasonOption.CONTACT_CENTER,
              title: 'Contact Center',
              description: '',
            },
            {
              code: reasonOption.DIGITAL_SUPPORT,
              title: 'Digital Support',
              description: '',
            },
          ];
        } else {
          this.reasonOptionArray = [
            {
              code: reasonOption.CUSTOMER_NOT_PRESENT,
              title: 'Customer Not Present',
              description: '',
            },
          ];
        }
      }
    } else if (this.isFeatureAccessibleForContactCenter()) {
      this.reasonOptionArray = [
        {
          code: reasonOption.CONTACT_CENTER,
          title: 'Contact Center',
          description: '',
        },
        {
          code: reasonOption.DIGITAL_SUPPORT,
          title: 'Digital Support',
          description: '',
        },
      ];
    } else {
      this.reasonOptionArray = [
        {
          code: reasonOption.CUSTOMER_NOT_PRESENT,
          title: 'Customer Not Present',
          description: '',
        },
      ];
    }
  }

  ngOnInit(): void {
    this.accountData = this.data;
    this.reasonForm.controls['action'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.requiredUploadDocument = this.actionNoDocumentsRequired(value);
      });
    this.reasonForm.controls['reason'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((value: reasonOption) => {
        this.reasonOptionSelected = value;
        if (value === reasonOption.CUSTOMER_NOT_PRESENT) {
          this.reasonForm.controls['action'].addValidators(Validators.required);
          if (this.actionsArray.length === 0) {
            this.getCustomerNotPresentActions();
          }
        } else {
          this.reasonForm.controls['action'].clearValidators();
          this.reasonForm.controls['action'].updateValueAndValidity();
        }
      });
  }

  isFeatureAccessibleForContactCenter() {
    return this.sessionService.hasRole('AccountManagement.EfrontUser');
  }

  onSubmit(): void {
    this.dialogRef.close({
      success: true,
      skipBio: true,
      skipBioForm: this.reasonForm.getRawValue(),
      documents: this.cloneOfObjects,
    });
  }

  goBack(): void {
    this.dialogRef.close('back');
  }

  async filesDropped(files: any) {
    if (files[0].size > 1024000) {
      this.toast.show(
        null,
        'Document too large',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }
    const base64 = await this.toBase64(files[0]);
    const prefixDocument = this.reasonForm.controls['action'].value;
    this.cloneOfObjects.push({
      name: files[0].name,
      description: files[0].name,
      fileSize: this.fileSizeUnit(files[0].size),
      icon: 'ic-delete',
      required: false,
      document: {
        filename: `${prefixDocument}_${files[0].name}`,
        format: files[0].type.split('/')[1],
        data: base64,
      },
    });
    // this.attachment.nativeElement.value = '';
  }

  fileSizeUnit(size: number) {
    if (size < 1000) {
      this.size = size;
      this.unit = 'bytes';
    } else if (size < 1000 * 1000) {
      this.size = size / 1000;
      this.unit = 'kb';
    } else if (size < 1000 * 1000 * 1000) {
      this.size = size / 1000 / 1000;
      this.unit = 'mb';
    } else {
      this.size = size / 1000 / 1000 / 1000;
      this.unit = 'gb';
    }

    this._truncatedSize = Math.trunc(this.size);
    return this._truncatedSize + ' ' + this.unit;
  }

  async onChange(file: any) {
    let _file: any;
    if (file && file?.files) {
      _file = file?.files[0];
    }
    //DragDrop
    if (file && file[0]) {
      _file = file[0];
    }
    if (!_file) {
      return;
    }
    if (_file.size > 1024000) {
      this.toast.show(
        null,
        'DOCUMENTS.MAX_SIZE_ERROR',
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        true
      );
      return;
    }
    if (this.allowedFileTypes) {
      if (!this.allowedFileTypes.includes(_file.type)) {
        this.toast.show(
          null,
          'DOCUMENTS.UNSUPPORTED_TYPE_ERROR',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      }
    }
    const base64 = await this.toBase64(file.files[0]);
    const prefixDocument = this.reasonForm.controls['action'].value;
    this.cloneOfObjects.push({
      name: file.files[0].name,
      description: file.files[0].name,
      fileSize: this.fileSizeUnit(file.files[0].size),
      icon: 'ic-delete',
      required: false,
      document: {
        filename: `${prefixDocument}_${file.files[0].name}`,
        format: file.files[0].type.split('/')[1],
        data: base64,
      },
      uploadedFile: file.files[0],
    });
  }

  getCustomerNotPresentActions() {
    this.api
      .get<any>(`/v1/backoffice/profilerequest/actions`)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res: {
          statusMessage: string;
          statusCode: string;
          successful: boolean;
          responseObject: string[];
        }) => {
          this.actionsArray = res?.responseObject;
        }
      );
  }

  deleteUpload(object: any) {
    const index = this.cloneOfObjects.indexOf(object);
    this.cloneOfObjects.splice(index, 1);
  }

  private actionNoDocumentsRequired(action: string): boolean {
    /*array of actions that no longer required upload documents*/
    const actionNoDocumentsRequiredArray = ['KnownAgent'];
    return !actionNoDocumentsRequiredArray.some(element =>
      element.includes(action)
    );
  }

  isFormValid() {
    if (this.reasonOptionSelected === reasonOption.CUSTOMER_NOT_PRESENT) {
      if (this.requiredUploadDocument) {
        return this.cloneOfObjects.length !== 0 && this.reasonForm.valid;
      } else {
        return this.reasonForm.valid;
      }
    }
    return this.reasonForm.valid;
  }

  getAvatarName(fullName: string): string {
    return fullName
      .split(' ')
      .map(v => v.charAt(0).toUpperCase())
      .join(' ');
  }

  ngOnDestroy(): void {
    this.destroy$.next('');
    this.destroy$.complete();
  }

  toBase64 = (file: any) =>
    new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      /*reader.onload = () => resolve(reader.result?.toString());
        reader.onerror = error => reject(error);*/
      reader.onload = () => {
        let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '');
        if (encoded && encoded.length % 4 > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });
}
