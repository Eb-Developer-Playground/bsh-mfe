import { Component, Input } from '@angular/core';

import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-customer-images-preview-modal',
  templateUrl: './customer-images-preview-modal.component.html',
  styleUrls: ['./customer-images-preview-modal.component.scss'],
})
export class CustomerImagesPreviewModalComponent {
  @Input() imageSource!: SafeResourceUrl | string;
  canDisplayImage: boolean = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CustomerImagesPreviewModalComponent>
  ) {}

  ngOnInit(): void {}

  hide = () => this.dialogRef.close();
}
