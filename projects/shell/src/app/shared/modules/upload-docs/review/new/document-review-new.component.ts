import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { DocumentsReviewService } from '@app/shared/modules/upload-docs/review/documents-review.service';

@Component({
  selector: 'app-document-review-new',
  templateUrl: './document-review-new.component.html',
  styleUrls: ['../document-review.component.scss'],
})
export class DocumentReviewComponentNew implements OnInit, OnChanges {
  documents: any[] = [];
  @Input() ticketId!: any;
  @Input({ required: true }) service!: string;
  @Input() title: string = 'Required Documents';
  @Input() skinned = false;
  @Input() excludedFiles: string[] = [];
  today = new Date();

  constructor(protected documentReviewService: DocumentsReviewService) {
    this.documentReviewService.documents$.subscribe((res: any) => {
      this.documents = res
        .map((doc: any) => {
          return { ...doc, filename: doc.fileNameWithExtension };
        })
        .filter((doc: any) => {
          return !this.excludedFiles.includes(doc.filename);
        });
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.ticketId?.currentValue) {
      this.documentReviewService.getDocuments(
        changes.ticketId.currentValue,
        changes.service?.currentValue
      );
    }
  }

  ngOnInit(): void {}
}
