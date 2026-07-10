import { Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MessageBoxType, ToastService } from '../../toast';
import { IDocumentSpec, IUploadedDocument } from '../models';
import { FileSizePipe } from '../file-size.pipe';
import { FilenameLabelPipe } from '../filenameLabel.pipe';
import { Observable, Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import {
  ISubsidiary,
  SessionService,
} from '@app/shared/services/session/session.service';
import { CameraModalComponent } from '../../document-upload/camera-modal/camera-modal.component';
import { UIService } from '@app/shared/services';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-documents-upload-drc',
  templateUrl: './documents-upload-drc.component.html',
  styleUrls: ['./documents-upload-drc.component.scss'],
  imports: [COMPAT_IMPORTS, FileSizePipe, FilenameLabelPipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentsUploadDrcComponent
  implements OnInit, OnChanges, OnDestroy
{
  @Input() title = 'DOCUMENTS.TITLE';
  @Input() description = 'DOCUMENTS.DESCRIPTION';
  @Input() allowedFileTypes: string[] | null = null;
  @Input() documentSpecs: IDocumentSpec[] = [];
  @Input() showConfirmation: boolean = false;
  @Input() contentOnly: boolean = false;
  @Input() allowAdditional: boolean = true;
  @Input() photoReuse: any;
  @Input() signatuReuse: any;
  @Input() onUploadFile!: (
    document: IUploadedDocument
  ) => Observable<{ successful: boolean; [key: string]: any }>;
  @Input() containerDocumentNoGrow: boolean = false;
  @Input() confirmationText: string = 'DOCUMENTS.CONFIRM_DESCRIPTION';
  @Output() onConfirmed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() onUploaded: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Input() additionalDocCode?: string;

  private destroySubject = new Subject();
  cloneOfObjects: Array<IUploadedDocument> = [];
  selectedObject: IUploadedDocument | null = null;
  placeholderImage =
    '../../../../../../../assets/images/Illustration-background.svg';
  confirmationForm: UntypedFormGroup = new UntypedFormGroup({});
  _defaultTypes: string[] = [
    'image/svg+xml',
    'image/png',
    'image/jpg',
    'image/jpeg',
    'application/pdf',
  ];
  subsidiary!: ISubsidiary;
  scanner: any;
  CAMERA_MAX_UPLOAD_SIZE: number = 150 * 1024; // 150 KB
  MAX_UPLOAD_SIZE: number = 10 * 1024 * 1024;

  constructor(
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    private toastService: ToastService,
    private session: SessionService,
    private uiService: UIService,
    public translateService: TranslateService,
    private router: Router
  ) {
    this.confirmationForm = this.fb.group({
      confirm: [false, [Validators.required]],
    });
  }

  async ngOnInit(): Promise<void> {
    this.subsidiary = this.session.subsidiary;

    this.confirmationForm.valueChanges
      .pipe(takeUntil(this.destroySubject))
      .subscribe(ch => {
        this.onConfirmed.emit(this.confirmationForm.valid);
      });

    this.initializeCloneOfObjects();

    await this.loadScannerJs();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['documentSpecs'] || changes['photoReuse'] || changes['signatuReuse']) {
      this.initializeCloneOfObjects();
    }
  }

  private initializeCloneOfObjects(): void {
    if (!this.documentSpecs) {
      return;
    }

    this.cloneOfObjects = this.documentSpecs.map((doc: any) => {
      let reusedData: any = null;

      // Check if it's Passport or Signature and use reused data if available
      if (doc.name === 'Passport' && this.photoReuse?.data) {
        reusedData = this.photoReuse;
      } else if (doc.name === 'Signature' && this.signatuReuse?.data) {
        reusedData = this.signatuReuse;
      }

      const fileName = reusedData ? `reused_${doc.name.toLowerCase()}.jpg` : '';

      let blobUrl = this.placeholderImage; // Default to placeholder image
      if (reusedData?.data) {
        const file = this.base64ToFile(reusedData.data, fileName);
        blobUrl = URL.createObjectURL(file); // Create blob URL from file
      }

      // Populate the document with reused data if available
      return {
        success: !!reusedData, // If reusedData exists, mark it as success
        file: reusedData ? this.base64ToFile(reusedData?.data, fileName) : null,
        fileName: fileName,
        fileSize: reusedData
          ? this.humanizeFileSize(this.calculateBase64Size(reusedData.data))
          : '',
        url: blobUrl,
        icon: reusedData?.data ? 'ic-delete' : 'ic-upload',
        document: reusedData?.data
          ? {
              filename: `reused_${doc.name.toLowerCase()}.jpg`,
              docCode: doc.docCode || doc.documentsCode || '',
              format: this.getFileExtension(reusedData.data),
              data: reusedData?.data, // Extract only the base64 part
            }
          : { filename: '', format: '', data: '' },
        maxSize: doc.maxSize || this.MAX_UPLOAD_SIZE,
        ...doc,
      };
    });

    this.notifyChangedUploads();
  }

  async handleOption(option: string, obj: any): Promise<void> {
    switch (option) {
      case 'browse':
        this.browseFile(obj);
        break;
      case 'camera':
        this.openCameraModal(obj);
        break;
      case 'scan':
        this.triggerScan(obj);
        break;
      default:
        this.toastService.show(
          null,
          'Unknown option',
          MessageBoxType.INFO,
          5000,
          undefined,
          undefined,
          true
        );
    }
  }

  triggerScan(obj: IUploadedDocument): void {
    this.scanner.scan(this.processScannedImage.bind(this, obj), {
      use_asprise_dialog: true,
      show_scanner_ui: true,
      twain_cap_setting: { ICAP_PIXELTYPE: 'TWPT_RGB' },
      output_settings: [
        {
          type: 'return-base64',
          format: 'jpg',
        },
      ],
    });
  }

  processScannedImage(
    obj: IUploadedDocument,
    successful: boolean,
    msg: string,
    response: any
  ): void {
    // Check if scanning was successful
    if (!successful) {
      this.toastService.show(
        null,
        `${msg} || Scanning failed`,
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        true
      );
      return;
    }

    // Check if user cancelled the scan
    if (successful && msg && msg.toLowerCase().indexOf('user cancel') >= 0) {
      this.toastService.show(
        null,
        'User cancelled',
        MessageBoxType.WARNING,
        5000,
        undefined,
        undefined,
        true
      );
      return;
    }

    try {
      // Parse and process the response
      const scanResponseData = JSON.parse(response);
      const base64Data = scanResponseData.output[0].result[0]; // Get base64 data
      const fileType = 'jpg';

      const scannedFile = {
        result: base64Data, // Base64 image data
        format: fileType,
        name: `scanned_image.${fileType}`, // Create a mock name
        size: this.getBase64FileSize(base64Data),
      };

      // resize the scanned image
      this.resizeBase64Image(base64Data, this.MAX_UPLOAD_SIZE, fileType)
        .then(resizedBase64 => {
          // Update the file object with resized data
          scannedFile.result = resizedBase64;
          scannedFile.size = this.getBase64FileSize(resizedBase64);

          // Pass the resized file to handleCapturedImage
          this.handleCapturedImage(scannedFile, obj, true);
        })
        .catch(() => {
          this.toastService.show(
            'Error',
            this.translateService.instant(
              'COMMON.DOCUMENTS.RESIZE_SCANNED_IMAGE '
            ),
            MessageBoxType.DANGER,
            5000,
            undefined,
            undefined,
            true
          );
        });
    } catch (error) {
      this.toastService.show(
        null,
        this.translateService.instant('COMMON.DOCUMENTS.ERROR_SCANNER '),
        MessageBoxType.DANGER,
        5000,
        undefined,
        undefined,
        true
      );
    }
  }

  openCameraModal(obj: IUploadedDocument) {
    const dialogRef = this.dialog.open(CameraModalComponent, {
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe(async (result: File) => {
      if (result) {
        let processedFile = result;

        if (result.size > this.CAMERA_MAX_UPLOAD_SIZE) {
          // Resize the image to reduce its size
          try {
            processedFile = await this.uiService.resizeImage(
              result,
              this.CAMERA_MAX_UPLOAD_SIZE
            );
            if (processedFile.size > this.CAMERA_MAX_UPLOAD_SIZE) {
              this.toastService.show(
                'Error',
                this.translateService.instant('COMMON.DOCUMENTS.IMAGE_LARGE '),
                MessageBoxType.DANGER,
                5000,
                undefined,
                undefined,
                true
              );
              return;
            }
          } catch (error) {
            this.toastService.show(
              'Error',
              this.translateService.instant(
                'COMMON.DOCUMENTS.RESIZE_IMAGE_ERROR '
              ),
              MessageBoxType.DANGER,
              5000,
              undefined,
              undefined,
              true
            );
            return;
          }
        }

        await this.handleCapturedImage(processedFile, obj);
      }
    });
  }

  async handleCapturedImage(
    file: any,
    obj: IUploadedDocument,
    isScanned: boolean = false
  ) {
    let base64Data: string;

    if (isScanned) {
      // Use the base64 string from the scanned file
      base64Data = file.result;
    } else {
      // Convert uploaded file to base64
      base64Data = await this.toBase64(file);
    }

    const rawFileType = isScanned
      ? file.format
      : file.type?.split('/')[1] || '';
    const fileType = this.normalizeImageExtension(rawFileType);
    const mimeType = isScanned ? `image/${rawFileType || 'jpeg'}` : file.type;

    obj.file = file;
    obj.fileSize = this.humanizeFileSize(
      isScanned ? base64Data.length : file.size
    );
    obj.url = isScanned
      ? `data:${mimeType};base64,${base64Data}`
      : this.getUploadUrl(file);
    obj.icon = 'ic-delete';
    obj.document = {
      filename: obj.key || obj.name,
      docCode: obj.docCode || '',
      format: fileType,
      data: isScanned ? `data:${mimeType};base64,${base64Data}` : base64Data,
    };
    this.notifyChangedUploads();
  }

  private loadScannerJs(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.asprise.com/scannerjs/scanner.js';
      script.onload = () => {
        this.scanner = (window as any).scanner; // Assign scanner to the component variable
        resolve();
      };
      script.onerror = error => {
        reject(error);
      };
      document.body.appendChild(script);
    });
  }

  browseFile(obj: any): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.getFileTypes(obj);
    input.onchange = (event: any) => {
      this.onChange(event, obj);
    };
    input.click();
  }

  browseAdditionalFile(): void {
    const input = document.createElement('input');
    input.type = 'file';
    // Adjust the accept attribute as needed
    input.accept = this.allowedFileTypes ? this.allowedFileTypes.join(',') : '';
    input.onchange = (event: any) => {
      this.onChange(event);
    };
    input.click();
  }

  get showAdditionalDocUpload(): boolean {
    if (!this.allowAdditional) {
      return false;
    }

    if (this.subsidiary?.countryCode === 'CD') {
      const isKnownAgentRoute = this.router.url.includes('/known-agent');
      const isRemoveAgentRoute = this.router.url.includes('/remove-agent');
      return !(isKnownAgentRoute || isRemoveAgentRoute);
    }

    return true;
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

  async onChange(event: any, object?: IUploadedDocument) {
    let _file: File | null = null;

    if (event && event.target && event.target.files && event.target.files[0]) {
      _file = event.target.files[0];
    } else if (event && event[0]) {
      // For drag and drop events
      _file = event[0];
    }

    if (!_file) {
      return;
    }

    if (object?.maxSize) {
      if (_file.size > object?.maxSize) {
        this.toastService.show(
          null,
          'DOCUMENTS.SIZE_LIMIT_ERROR',
          MessageBoxType.WARNING,
          5000,
          undefined,
          undefined,
          true
        );
        return;
      }
    } else if (_file.size > this.MAX_UPLOAD_SIZE) {
      this.toastService.show(
        null,
        'DOCUMENTS.SIZE_LIMIT_ERROR',
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
        this.toastService.show(
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

    if (object) {
      const doc = this.documentSpecs.find(f => f.name === object.name);
      if (doc?.fileTypes) {
        const fileExtension = this.normalizeImageExtension(
          _file.type.split('/')[1]
        );
        if (
          !doc.fileTypes.includes(_file.type) &&
          !doc.fileTypes.includes(fileExtension)
        ) {
          this.toastService.show(
            null,
            `Wrong file type. Expected types are ${doc.fileTypes?.join(', ')}`,
            MessageBoxType.WARNING,
            5000,
            undefined,
            undefined,
            true
          );
          return;
        }
      }
      object.file = _file;
      object.fileSize = this.humanizeFileSize(_file.size);
      object.url = this.getUploadUrl(_file);
      object.icon = 'ic-delete';
      object.document = {
        filename: object.name,
        docCode: object.key || object.docCode || '',
        processName: object.processName || '',
        service: object.service || '',
        format: this.normalizeImageExtension(_file.type.split('/')[1]),
        data: await this.toBase64(_file),
      };

      this.notifyChangedUploads();
    } else {
      const url = this.getUploadUrl(_file);
      const base64 = await this.toBase64(_file);
      const count = this.cloneOfObjects.filter(d => d.isAdditional)?.length;
      if (count > 2) {
        this.toastService.show(
          this.translateService.instant(
            'COMMON.DOCUMENTS.DOCUMENTS_UPLOAD_LIMIT'
          ),
          this.translateService.instant(
            'COMMON.DOCUMENTS.ADDITIONAL_DOCUMENT_LIMIT'
          ),
          MessageBoxType.DANGER,
          5000,
          undefined,
          undefined,
          false
        );
        return;
      }

      const newObject: IUploadedDocument = {
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
          format: this.normalizeImageExtension(_file.type.split('/')[1]),
          data: base64,
          docCode: this.additionalDocCode ?? '',
        },
        file: _file,
      };
      this.cloneOfObjects.push(newObject);
      this.notifyChangedUploads();
    }
  }

  deleteUpload(object: IUploadedDocument) {
    if (object.isAdditional) {
      const index = this.cloneOfObjects.indexOf(object);
      this.cloneOfObjects.splice(index, 1);
    } else {
      object.file = undefined;
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
    } else if (type === 'image/jpeg' || type === 'image/jpg') {
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

  callUploadFile(document: IUploadedDocument) {
    this.onUploadFile(document).subscribe({
      next: resp => {
        document.success = resp.successful;
        document.hasUploadError = false;
        this.notifyChangedUploads();
      },
      error: () => {
        document.hasUploadError = true;
      },
    });
  }

  ngOnDestroy(): void {
    this.destroySubject.next('');
    this.destroySubject.complete();
  }

  base64ToFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);|:(.*?)(;|$)/);
    const mime = mimeMatch ? mimeMatch[1] || mimeMatch[2] : '';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  private calculateBase64Size(base64String: string): number {
    const headerEndIndex = base64String.indexOf(',');
    const headerLength = headerEndIndex >= 0 ? headerEndIndex + 1 : 0;
    const stringLength = base64String.length - headerLength;
    const sizeInBytes = 4 * Math.ceil(stringLength / 3) * 0.5624896334383812;
    return sizeInBytes;
  }

  private getFileExtension(dataurl: string): string {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);|:(.*?)(;|$)/);
    const mime = mimeMatch ? mimeMatch[1] || mimeMatch[2] : '';
    return this.normalizeImageExtension(mime.split('/')[1]);
  }

  private normalizeImageExtension(extension?: string): string {
    const normalized = (extension || '').toLowerCase();
    return normalized === 'jpeg' ? 'jpg' : normalized;
  }

  getBase64FileSize(base64String: string) {
    const padding = (base64String.match(/=+$/) || [''])[0].length; // Count padding characters
    const base64Length = base64String.length - padding; // Exclude padding
    return (base64Length * 3) / 4; // Convert to bytes
  }

  resizeBase64Image(
    base64: string,
    maxSizeInBytes: number,
    fileType: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;
        let quality = 0.9; // Start with 90% quality
        const MIN_QUALITY = 0.1;
        const MIN_DIMENSION = 100; // Minimum width or height
        const MAX_ITERATIONS = 10;
        let iterations = 0;

        const resize = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const resizedBase64 = canvas.toDataURL(`image/${fileType}`, quality);

          const resizedSize = this.getBase64FileSize(
            resizedBase64.split(',')[1]
          ); // Exclude the prefix
          if (resizedSize <= maxSizeInBytes || iterations >= MAX_ITERATIONS) {
            resolve(resizedBase64.split(',')[1]); // Return only the base64 data
          } else {
            // Reduce dimensions and quality and try again
            width = Math.max(width * 0.9, MIN_DIMENSION);
            height = Math.max(height * 0.9, MIN_DIMENSION);
            quality = Math.max(quality - 0.1, MIN_QUALITY);
            iterations++;
            resize();
          }
        };

        resize();
      };

      img.onerror = error => {
        reject(error);
      };

      img.src = `data:image/${fileType};base64,${base64}`;
    });
  }
}
