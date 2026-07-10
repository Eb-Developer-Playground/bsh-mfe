import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-documents-upload',
  template: '<ng-content></ng-content>',
  standalone: true,
})
export class DocumentsUploadComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() requiredDocuments: any[] = [];
  @Output() onUploaded = new EventEmitter<any[]>();
}
