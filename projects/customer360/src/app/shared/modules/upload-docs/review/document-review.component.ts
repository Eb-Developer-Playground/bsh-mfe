import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FileSizePipe } from '../file-size.pipe';

@Component({
  selector: 'app-document-review',
  templateUrl: './document-review.component.html',
  styleUrls: ['./document-review.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FileSizePipe,
  ],
})
export class DocumentReviewComponent implements OnInit {
  @Input() documents!: any[];
  @Input() ticketId!: any;
  @Input() skinned = false;

  ngOnInit(): void {}

  previewUpload(doc: any): void {}
}
