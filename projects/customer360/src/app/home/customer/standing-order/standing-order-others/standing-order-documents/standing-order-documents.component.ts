import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MessageBoxType, ToastService } from '@app/shared/modules/toast';
@Component({
  selector: 'app-standing-order-documents',
  templateUrl: './standing-order-documents.component.html',
  styleUrls: ['./standing-order-documents.component.scss'],
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
  ],
})
export class StandingOrderDocumentsComponent implements OnInit {
  @Output() cloneOfObjectsEmitter: EventEmitter<any> = new EventEmitter();
  @Input() orderType = '';
  @ViewChild('attachments') attachment: any;
  size: any;
  unit: any;
  _truncatedSize: any;
  supportDocumentBackground =
    '../../../../../../../assets/images/Illustration-background.svg';
  btnTitle = 'Add Additional Document';
  cloneOfObjects: Array<any> = [];
  defaultDocument: Array<any> = [
    'Customer Instruction',
    // 'Additional Document 1',
    // 'Additional Document 2',
    // 'Additional Document 3',
  ];
  additionalDoc: Array<any> = [];
  isChecked = false;
  isAdditionalDocSelected = false;
  lastUploadedIndex = 0; //upload checker

  constructor(
    public dialog: MatDialog,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.seedDocuments();
    this.cloneOfObjectsEmitter.emit(
      this.cloneOfObjects.filter(x => x.uploadedFile !== null)
    ); // Emit the initial documents
  }

    // toggle() {
    //     this.isAdditionalDocSelected = !this.isAdditionalDocSelected;
    //     if (this.isAdditionalDocSelected) {
    //         this.btnTitle = "Add Required Document";
    //     }
    //     else {
    //         this.btnTitle = "Add Additional Document";
    //     }
    //     this.reset();
    // }
    reset() {
        this.cloneOfObjects = [];
        this.cloneOfObjectsEmitter.emit(this.cloneOfObjects);
        this.seedDocuments();
    }
    isValid() {
        return (
            this.getOtherDoc.filter((x) => x.uploadedFile !== null).length == 0
        );
    }
    get getOtherDoc(): any[] {
        if (this.isAdditionalDocSelected) {
            return this.cloneOfObjects;
        }
        return this.cloneOfObjects.filter(
            (x) => x.name == this.defaultDocument[0],
        );
    }
    onChange(file: any, fileName: string, object?: any) {
        if (file.files.length == 0) {
            this.cloneOfObjectsEmitter.emit([]);
            return;
        }
        if (file.files[0].size > 1024000) {
            this.toastService.show(
                "Document too large",
                "",
                MessageBoxType.DANGER,
                5000, undefined, undefined, false
            );
            return;
        }

    if (object) {
      object.uploadedFile = file.files[0];
      object.fileName = fileName;
      let fileSize = file.files[0].size;
      object.fileSize = this.fileSizeUnit(fileSize);
      object.Url = this.getUploadUrl(file.files[0]);
      object.icon = 'ic-delete';

      this.cloneOfObjectsEmitter.emit(
        this.cloneOfObjects.filter(x => x.uploadedFile !== null)
      );
      this.attachment.nativeElement.value = '';

      // Update the lastUploadedIndex when a document is uploaded
      this.lastUploadedIndex =
        this.cloneOfObjects.findIndex(obj => obj === object) + 1;
    } else {
      let url = this.getUploadUrl(file.files[0]);
      this.cloneOfObjects.push({
        uploadedFile: file.files[0],
        name: fileName,
        fileSize: this.fileSizeUnit(file.files[0].size),
        Url: url,
        icon: 'ic-delete',
        additionalDocument: true,
      });
      this.cloneOfObjectsEmitter.emit(
        this.cloneOfObjects.filter(x => x.uploadedFile !== null)
      );
    }
  }
  seedDocuments() {
    this.defaultDocument.map(name => {
      let obj = {
        uploadedFile: null,
        name: name,
        fileSize: null,
        Url: null,
        icon: 'ic-upload',
        additionalDocument: false,
      };
      this.cloneOfObjects.push(obj);
    });
    // Count the number of additional documents
    const count =
      this.cloneOfObjects.filter(d => d.additionalDocument)?.length || 0;
    for (let i = 1; i <= 10; i++) {
      let obj = {
        uploadedFile: null,
        name: `Additional document ${count + i}`,
        fileSize: null,
        Url: null,
        icon: 'ic-upload',
        additionalDocument: true,
      };
      this.cloneOfObjects.push(obj);
    }
  }
  // deleteUpload(object: any) {
  //     let index = this.cloneOfObjects.indexOf(object);
  //     this.cloneOfObjects.splice(index, 1);
  //     object.uploadedFile = null;
  //     object.icon = 'ic-upload';

  //     this.cloneOfObjects.push(object);
  //     this.cloneOfObjectsEmitter.emit(this.cloneOfObjects.filter(x => x.uploadedFile !== null));

  // }

  deleteUpload(object: any) {
    let index = this.cloneOfObjects.indexOf(object);
    if (index !== -1) {
      // Check if the object being deleted is an additional document
      if (object.additionalDocument) {
        // Remove the object from the array
        this.cloneOfObjects.splice(index, 1);

        // Update the names of additional documents
        let additionalDocs = this.cloneOfObjects.filter(
          x => x.additionalDocument
        );
        additionalDocs.forEach((doc, i) => {
          doc.name = `Additional Document ${i + 1}`;
        });
      } else {
        // For default documents, just reset the uploadedFile and icon
        object.uploadedFile = null;
        object.icon = 'ic-upload';
      }
      // Emit the filtered array
      this.cloneOfObjectsEmitter.emit(
        this.cloneOfObjects.filter(x => x.uploadedFile !== null)
      );
    }
    // Update lastUploadedIndex if the deleted object was the last uploaded
    if (index + 1 === this.lastUploadedIndex) {
      this.lastUploadedIndex--;
    }
  }

  openUploadedDocsDialog() {
    this.isChecked = true;
  }
  //#region helpers
  filesDropped(files: any, name: string) {
    if (files[0].size > 1024000) {
      return;
    }
    let url = this.getUploadUrl(files[0]);
    this.cloneOfObjects.push({
      uploadedFile: files[0],
      name: name,
      fileSize: this.fileSizeUnit(files[0].size),
      Url: url,
      icon: 'ic-delete',
      additionalDocument: true,
    });

    const arrayDocsBae64: any = [];
    this.cloneOfObjects.forEach(file => {
      this.toBase64(file.uploadedFile).then(base64File => {
        const objDoc = { Filename: '', Format: '', data: '' };

        objDoc.Format = file.type;
        objDoc.Filename = name;
        objDoc.data = base64File;

        arrayDocsBae64.push(objDoc);
        this.cloneOfObjectsEmitter.emit(arrayDocsBae64);
      });
    });
    if (this.attachment && this.attachment.nativeElement) {
      this.attachment.nativeElement.value = '';
    }
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
  // Method to determine if a document section should be rendered
  shouldRenderDocument(index: number): boolean {
    return index <= this.lastUploadedIndex;
  }
  //#endregion
}
