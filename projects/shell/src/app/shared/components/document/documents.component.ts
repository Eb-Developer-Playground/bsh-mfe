import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss'],
})
export class DocumentComponent implements OnInit {
  @Input() RequiredDocuments!: Array<any>[];

  constructor() {}

  ngOnInit(): void {}

  fileUpload(docs: any) {}

  deleteUpload(docs: any) {}
}
