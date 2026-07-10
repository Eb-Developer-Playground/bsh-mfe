import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  standalone: true,
  imports: [TranslateModule],
  styleUrls: ['./image-preview-modal.component.scss'],
})
export class ImagePreviewModalComponent implements OnInit {
  @Input() imageSource!: SafeResourceUrl | string;

  constructor(
    translateService: TranslateService,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ImagePreviewModalComponent>
  ) {}

  ngOnInit(): void {}

  hide = () => this.dialogRef.close();
}
