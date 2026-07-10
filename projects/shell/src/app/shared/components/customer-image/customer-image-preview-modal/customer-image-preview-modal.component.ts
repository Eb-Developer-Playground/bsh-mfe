import { Component, Input } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-customer-image-preview-modal',
  templateUrl: './customer-image-preview-modal.component.html',
  styleUrls: ['./customer-image-preview-modal.component.scss'],
})
export class CommonCustomerImagePreviewModalComponent {
  @Input() imageSource!: SafeResourceUrl | string;
  canDisplayImage = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CommonCustomerImagePreviewModalComponent>
  ) {}

  hide = () => this.dialogRef.close();
}
