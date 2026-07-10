import { Component, Input, OnInit } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-image-preview-dialog',
  templateUrl: './image-preview.dialog.html',
  styleUrls: ['./image-preview.dialog.scss'],
})
export class ImagePreviewDialog implements OnInit {
  @Input() imageSource!: SafeResourceUrl | string;

  constructor(public dialog: MatDialog) {}

  ngOnInit(): void {}

  hide = () => this.dialog.closeAll();
}
