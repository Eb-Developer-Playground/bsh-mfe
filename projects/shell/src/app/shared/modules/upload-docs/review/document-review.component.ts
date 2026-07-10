import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../../compat-barrel';
import { FileSizePipe } from '../file-size.pipe';

@Component({
  selector: 'app-document-review',
  templateUrl: './document-review.component.html',
  styleUrls: ['./document-review.component.scss'],
  imports: [COMPAT_IMPORTS, FileSizePipe],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentReviewComponent implements OnInit {
  @Input() documents!: any[];
  @Input() ticketId!: any;
  @Input() skinned = false;
  today = new Date();

  constructor() {}

  ngOnInit(): void {}

  previewUpload(doc: any): void {}
}
