import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SafeResourceUrl } from '@angular/platform-browser';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-customer-image-preview-modal',
  templateUrl: './customer-image-preview-modal.component.html',
  styleUrls: ['./customer-image-preview-modal.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class CommonCustomerImagePreviewModalComponent {
  @Input() imageSource!: SafeResourceUrl | string;
  canDisplayImage = false;

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CommonCustomerImagePreviewModalComponent>
  ) {}

  hide = () => this.dialogRef.close();
}
