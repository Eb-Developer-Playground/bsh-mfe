import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-cards',
  templateUrl: './document-cards.component.html',
  styleUrls: ['./document-cards.component.scss'],
})
export class DocumentCardsComponent implements OnInit {
  @Input() RequiredDocuments!: Array<any>[];

  constructor() {}

  ngOnInit(): void {}

  fileUpload(docs: any) {}

  deleteUpload(docs: any) {}
}
