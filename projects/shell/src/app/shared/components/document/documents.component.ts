import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentComponent implements OnInit {
  @Input() RequiredDocuments!: Array<any>[];

  constructor() {}

  ngOnInit(): void {}

  fileUpload(docs: any) {}

  deleteUpload(docs: any) {}
}
