import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { COMPAT_IMPORTS } from '../../compat-barrel';

@Component({
  selector: 'app-image-preview-dialog',
  templateUrl: './image-preview.dialog.html',
  styleUrls: ['./image-preview.dialog.scss'],
  imports: [COMPAT_IMPORTS],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]})
export class ImagePreviewDialog implements OnInit {
  @Input() imageSource!: SafeResourceUrl | string;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  hide = () => this.dialog.closeAll();
}
