import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MessageBoxType, ToastService } from '../toast';
import { IDocumentSpec, IUploadedDocument } from './models';
import { FileSizePipe } from './file-size.pipe';
import { FilenameLabelPipe } from './filenameLabel.pipe';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { CameraModalComponent } from '../document-upload/camera-modal/camera-modal.component';
import { UIService } from '@app/shared/services';
import { TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-documents-upload',
  templateUrl: './documents-upload.component.html',
  styleUrls: ['./documents-upload.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatDialogModule,
    TranslatePipe,
    FileSizePipe,
    FilenameLabelPipe,
  ],
})
export class DocumentsUploadComponent implements OnInit, OnChanges, OnDestroy {
  /*
    Some file types: 'image/svg+xml', 'image/png', 'image/jpeg', 'application/pdf'
     */
  @Input() title = 'DOCUMENTS.TITLE';
  @Input() description = 'DOCUMENTS.DESCRIPTION';
  @Input() allowedFileTypes: string[] | null = null;
  @Input() documentSpecs: IDocumentSpec[] = [];
  @Input() showConfirmation: boolean = false;
  @Input() contentOnly: boolean = false;
  @Input() containerDocumentNoGrow: boolean = false;
  @Input() confirmationText: string = 'DOCUMENTS.CONFIRM_DESCRIPTION';
  @Output() onConfirmed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onUploaded: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Input() filenamePrefix: string = '';
  @Input() docCode: string = '';
  @Output() documentsUploaded = new EventEmitter<any>();
  @ViewChild('attachments') attachment: any;
  private destroySubject = new Subject();
  cloneOfObjects: Array<IUploadedDocument> = [];
  placeholderImage =
    '../../../../../../../assets/images/Illustration-background.svg';
  confirmationForm: UntypedFormGroup;
  _defaultTypes: string[] = [
    'image/svg+xml',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
  ];

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private toastService: ToastService,
    private uIservice: UIService,
    private translate: TranslateService
  ) {
    this.confirmationForm = this.fb.group({
      confirm: [false, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.confirmationForm.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe(ch => {
        this.onConfirmed.emit(this.confirmationForm.valid);
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['documentSpecs']?.currentValue) {
      this.documentSpecs = changes?.['documentSpecs']?.currentValue;
      this.cloneOfObjects = this.documentSpecs?.map((doc: IDocumentSpec) => ({
        success: false,
        document: {
          filename: '',
          docCode: '',
          format: '',
          data: '',
        },
        icon: 'ic-upload',
        maxSize: 10240000,
        ...doc,
      }));
      this.notifyChangedUploads();
    }
  }

  humanizeFileSize(size: number) {
    let fzPipe = new FileSizePipe();
    return fzPipe.transform(size, 0);
  }

  toBase64 = (file: any) =>
    new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result?.toString());
      reader.onerror = error => reject(error);
    });

  getUploadUrl = (file: any) => {
    return URL.createObjectURL(file);
  };

  getFileTypes(obj: IUploadedDocument): string {
    if (obj?.fileTypes?.length) {
      return obj.fileTypes.join(',');
    }

    if (String(obj.name).toLowerCase().includes('photo')) {
      return ['image/png', 'image/jpg', 'image/jpeg'].join(',');
    }

    return this._defaultTypes.join(',');
  }

  async onChange(file: any, object?: IUploadedDocument) {
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
    if (_file.size > 10240000) {
      this.toastService.show(
        'DOCUMENTS.MAX_SIZE_ERROR',
        '',
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        true
      );
      return;
    }
    if (object?.maxSize) {
      if (_file.size > object?.maxSize) {
        this.toastService.show(
          '',
          'DOCUMENTS.SIZE_LIMIT_ERROR',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      }
    }
    if (this.allowedFileTypes) {
      if (!this.allowedFileTypes.includes(_file.type)) {
        this.toastService.show(
          '',
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
    if (object) {
      const mimeTypeMap: { [key: string]: string } = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        jpg: 'image/jpg',
        pdf: 'application/pdf',
      };
      const doc = this.documentSpecs.find(f => f.name === object.name);

      if (doc?.fileTypes) {
        const allowedMimeTypes = doc.fileTypes.map(
          ext => mimeTypeMap[ext] || ext
        );
        if (!allowedMimeTypes.includes(_file.type)) {
          this.toastService.show(
            `Wrong file type. Expected types are ${doc.fileTypes?.join(', ')}`,
            '',
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            false
          );
          return;
        }
      }
      object.file = _file;
      object.fileName = _file.name;
      object.fileSize = this.humanizeFileSize(_file.size);
      object.url = this.getUploadUrl(_file);
      object.icon = 'ic-delete';
      object.document = {
        filename: object.key || object.name || object.description,
        docCode: object.docCode || '',
        format: _file.type.split('/')[1],
        data: await this.toBase64(_file),
      };
      this.attachment.nativeElement.value = '';
    } else {
      let url = this.getUploadUrl(_file);
      const base64 = await this.toBase64(_file);
      const count = this.cloneOfObjects.filter(d => d.isAdditional)?.length;
      if (count > 2) {
        this.toastService.show(
          this.translate.instant('COMMON.DOCUMENTS.DOCUMENTS_UPLOAD_LIMIT'),
          this.translate.instant('COMMON.DOCUMENTS.ADDITIONAL_DOCUMENT_LIMIT'),
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
        return;
      }

      this.cloneOfObjects.push({
        name: `Additional ${count + 1}`,
        description: `Additional ${count + 1}`,
        fileName: _file.name,
        required: false,
        size: _file.size,
        success: false,
        fileSize: this.humanizeFileSize(_file.size),
        url: url,
        icon: 'ic-delete',
        isAdditional: true,
        document: {
          filename: `Additional_${count + 1}`,
          docCode: '',
          format: _file.type.split('/')[1],
          data: base64,
        },
        file: _file,
      });
      try {
        this.attachment.nativeElement.value = '';
      } catch (e) {}
    }
    this.notifyChangedUploads();
  }

  deleteUpload(object: IUploadedDocument) {
    if (object.isAdditional) {
      const index = this.cloneOfObjects.indexOf(object);
      this.cloneOfObjects.splice(index, 1);
    } else {
      object.file = undefined;
      object.fileName = undefined;
      object.fileSize = undefined;
      object.success = false;
      object.url = undefined;
      object.icon = 'ic-upload';
    }
    this.notifyChangedUploads();
  }

  private getFileType(type: string): string {
    if (type === 'image/svg+xml') {
      return 'svg';
    } else if (type === 'image/png') {
      return 'png';
    } else if (type === 'image/jpeg') {
      return 'jpg';
    } else if (type === 'application/pdf') {
      return 'pdf';
    } else {
      return '';
    }
  }

  notifyChangedUploads(): void {
    this.onUploaded.emit(this.cloneOfObjects);
  }
  scanDocument(): void {
    try {
      // Logic to scan document
      this.toastService.show(
        'Scanning document...',
        'Please wait while we scan your document',
        MessageBoxType.INFO,
        3000,
        undefined,
        undefined,
        false
      );
      // Perform scanning logic here, e.g., interacting with a scanner API
      // This could return a base64 string or a scanned document file
    } catch (error) {
      this.toastService.show(
        'Scan Error',
        'An error occurred while scanning the document.',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
    }
  }

  openCameraModal() {
    const dialogRef = this.dialog.open(CameraModalComponent, {
      width: '600px', // Set the width you prefer
      data: {
        // Pass any data if needed
      },
    });

    dialogRef.afterClosed().subscribe(async (result: File) => {
      if (result) {
        await this.handleCapturedImage(result);
      }
    });
  }
  async handleCapturedImage(file: File) {
    if (file.size > 1024000) {
      this.toastService.show(
        'documents uploads',
        'Document too large',
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        false
      );
      return;
    }

    const base64 = await this.uIservice.toBase64(file);

    this.cloneOfObjects.push({
      name: file.name,
      description: file.name,
      fileName: file.name,
      // mandatory: false,
      size: file.size,
      success: false,
      file: file,
      fileSize: this.humanizeFileSize(file.size),
      icon: 'ic-delete',
      isAdditional: true,
      document: {
        filename: `${this.filenamePrefix}_${file.name}`,
        format: file.type.split('/')[1],
        data: base64,
        // DocCode: this.docCode,
      },
    });
    this.documentsUploaded.emit(this.cloneOfObjects);
  }

  ngOnDestroy(): void {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }
}
