import { Component, Input, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../../compat-barrel';

@Component({
  selector: 'app-customer-images-preview-modal',
  templateUrl: './customer-images-preview-modal.component.html',
  styleUrls: ['./customer-images-preview-modal.component.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
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
