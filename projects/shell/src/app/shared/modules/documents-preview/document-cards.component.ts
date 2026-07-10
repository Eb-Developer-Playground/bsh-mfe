import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-document-cards',
  templateUrl: './document-cards.component.html',
  styleUrls: ['./document-cards.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class DocumentCardsComponent implements OnInit {
  @Input() RequiredDocuments!: Array<any>[];

  constructor() {}

  ngOnInit(): void {}

  fileUpload(docs: any) {}

  deleteUpload(docs: any) {}
}
