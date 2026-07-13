import { Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';
import { MessageBoxType } from '@app/shared/modules/toast/models';
import {
  ISubsidiary,
  SessionService,
} from '@app/shared/services/session/session.service';
import { Subject } from 'rxjs';
import { ToastService } from '../../modules/toast';
import { UIService } from '@app/shared/services/ui.service';
import { IUploadedDocument } from '../upload-docs';
import { CameraModalComponent } from './camera-modal/camera-modal.component';

@Component({
  selector: 'app-document-upload',
  templateUrl: './document-upload.component.html',
  styleUrls: ['./document-upload.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentUploadComponent implements OnInit {
  @Input() cloneOfObjects: Array<any> = [];
  @Input() allowedFileTypes: string[] = [
    'image/png',
    'image/jpeg',
    'application/pdf',
  ];
  @Input() requiredUploadDocument = true;
  @Input() reasonForm: any;
  @Input() docCode: string = ''; // New Input for DocCode
  @Input() filenamePrefix: string = ''; // New Input for filename prefix
  @Output() onConfirmed: EventEmitter<boolean> = new EventEmitter<boolean>();
  @Output() documentsUploaded = new EventEmitter<any>();
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  @ViewChild('canvasElement', { static: false }) canvasElement!: ElementRef;
  showCamera = false;
  videoDevices: MediaDeviceInfo[] = [];
  stream: MediaStream | null = null;

  size: any;
  unit: any;
  _truncatedSize: any;
  private destroySubject$ = new Subject();
  scanner: any;
  subsidiary!: ISubsidiary;
  confirmationForm!: UntypedFormGroup;

  constructor(
    private toastService: ToastService,
    private uIservice: UIService,
    private fb: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private session: SessionService
  ) {
    this.confirmationForm = this.fb.group({
      confirm: [false, [Validators.required]],
    });
  }

  async ngOnInit(): Promise<void> {
    this.subsidiary = this.session.subsidiary;

    this.confirmationForm.valueChanges.subscribe(() => {
      this.onConfirmed.emit(this.confirmationForm.valid);
    });

    await this.loadScannerJs();
  }

  async filesDropped(files: any) {
    if (files[0].size > 1024000) {
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
    const base64 = await this.uIservice.toBase64(files[0]);

    this.cloneOfObjects.push({
      documentName: files[0].name,
      documentDescription: files[0].name,
      documentFileName: files[0].name,
      mandatory: false,
      name: '',
      size: '',
      success: false,
      uploadedFile: files[0],
      fileSize: this.fileSizeUnit(files[0].size),
      icon: 'ic-delete',
      additionalDocument: true,
      document: {
        filename: `${this.filenamePrefix}_${files[0].name}`,
        format: files[0].type.split('/')[1],
        data: base64,
        DocCode: this.docCode,
      },
    });
    this.documentsUploaded.emit(this.cloneOfObjects);
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
    if (file && file[0]) {
      _file = file[0];
    }
    if (!_file) {
      return;
    }
    if (_file.size > 1024000) {
      this.toastService.show(
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

    const base64 = await this.uIservice.toBase64(file.files[0]);

    this.cloneOfObjects.push({
      documentName: file.files[0].name,
      documentDescription: file.files[0].name,
      documentFileName: file.files[0].name,
      mandatory: false,
      name: '',
      size: '',
      success: false,
      fileSize: this.fileSizeUnit(file.files[0].size),
      additionalDocument: true,
      document: {
        filename: `${this.filenamePrefix}_${file.files[0].name}`,
        format: file.files[0].type.split('/')[1],
        data: base64,
        DocCode: this.docCode,
      },
      uploadedFile: file.files[0],
    });
    this.documentsUploaded.emit(this.cloneOfObjects);
  }

  deleteUpload(object: any) {
    const index = this.cloneOfObjects.indexOf(object);
    this.cloneOfObjects.splice(index, 1);
    this.documentsUploaded.emit(this.cloneOfObjects);
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

  scanDocument(obj: any): void {
    this.scanner.scan(
      this.processScannedImage.bind(this, obj), // Pass `obj` and bind it to `processScannedImage`
      {
        use_asprise_dialog: true,
        show_scanner_ui: true,
        twain_cap_setting: { ICAP_PIXELTYPE: 'TWPT_RGB' },
        output_settings: [
          {
            type: 'return-base64',
            format: 'jpg',
          },
        ],
      }
    );
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
        MessageBoxType.WARNING
      );
      return;
    }

    // Check if user cancelled the scan
    if (successful && msg && msg.toLowerCase().indexOf('user cancel') >= 0) {
      this.toastService.show(null, 'User cancelled', MessageBoxType.WARNING);
      return;
    }

    try {
      // Parse and process the response
      const scanResponseData = JSON.parse(response);
      const scannedImage = scanResponseData.output[0].result[0]; // Get base64 data
      const format = scanResponseData.output[0].format || 'jpg';

      // Convert the base64 image string to a File object
      const file = this.dataURLtoFileForScannedImage(
        scannedImage,
        `scanned-document.${format}`
      );

      // Pass the File object to handleCapturedImage
      this.handleCapturedImage(file);
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
  dataURLtoFileForScannedImage(dataurl: string, filename: string): File {
    const [base64Header, base64Data] = dataurl.split(',');
    const mimeTypeMatch = base64Header.match(/:(.*?);/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : '';
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new File([byteArray], filename, { type: mimeType });
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
      documentName: file.name,
      documentDescription: file.name,
      documentFileName: file.name,
      mandatory: false,
      name: '',
      size: '',
      success: false,
      uploadedFile: file,
      fileSize: this.fileSizeUnit(file.size),
      icon: 'ic-delete',
      additionalDocument: true,
      document: {
        filename: `${this.filenamePrefix}_${file.name}`,
        format: file.type.split('/')[1],
        data: base64,
        DocCode: this.docCode,
      },
    });
    this.documentsUploaded.emit(this.cloneOfObjects);
  }

  ngOnDestroy(): void {
    this.destroySubject$.next('');
    this.destroySubject$.complete();
  }
}
