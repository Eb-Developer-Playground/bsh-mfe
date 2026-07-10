import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-review',
  templateUrl: './document-review.component.html',
  styleUrls: ['./document-review.component.scss'],
})
export class DocumentReviewComponent implements OnInit {
  @Input() documents!: any[];
  @Input() ticketId!: any;
  @Input() skinned = false;
  today = new Date();

  constructor() {}

  ngOnInit(): void {}

  previewUpload(doc: any): void {}
}
