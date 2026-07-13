import { Component, ElementRef, ViewChild, Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-signatory-slider',
  templateUrl: './signatory-slider.component.html',
  styleUrls: ['./signatory-slider.component.scss'],
  imports: [CommonModule, MatIconModule],
})
export class SignatorySliderComponent {
  @Input() mandateForm!: UntypedFormGroup;
  @Input() signatories: any[] = [];
  @ViewChild('slider', { read: ElementRef }) slider!: ElementRef;

  isOverlayVisible = false;
  overlayImageSrc: string = '';

  scrollLeft() {
    this.slider.nativeElement.scrollLeft -= 223 * 5;
  }

  scrollRight() {
    this.slider.nativeElement.scrollLeft += 223 * 5;
  }

  openOverlay(imageSrc: string) {
    this.overlayImageSrc = imageSrc;
    this.isOverlayVisible = true;
  }

  closeOverlay() {
    this.isOverlayVisible = false;
  }
}
