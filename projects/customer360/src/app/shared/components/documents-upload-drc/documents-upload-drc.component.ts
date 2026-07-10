import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IDocumentSpec, IUploadedDocument } from '@app/shared/modules/upload-docs';

@Component({
  selector: 'app-documents-upload-drc',
  template: '<ng-content></ng-content>',
  imports: [CommonModule],
})
export class DocumentsUploadDrcComponent {
  @Input() documentSpecs: IDocumentSpec[] = [];
  @Input() allowAdditional = false;
  @Input() title = '';
  @Output() onUploaded = new EventEmitter<IUploadedDocument[]>();
}
