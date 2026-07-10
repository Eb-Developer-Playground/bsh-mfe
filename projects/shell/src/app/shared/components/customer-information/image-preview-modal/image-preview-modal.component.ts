import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-image-preview-modal',
  templateUrl: './image-preview-modal.component.html',
  imports: [TranslatePipe],
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
