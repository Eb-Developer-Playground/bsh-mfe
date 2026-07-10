import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-camera-modal',
  templateUrl: './camera-modal.component.html',
  styleUrls: ['./camera-modal.component.scss'],
})
export class CameraModalComponent implements OnInit {
  capturedImage: string | null = null;
  videoElement!: HTMLVideoElement;
  canvasElement!: HTMLCanvasElement;
  videoDevices: MediaDeviceInfo[] = [];
  selectedDevice: string | null = null;

  constructor(public dialogRef: MatDialogRef<CameraModalComponent>) {}

  ngOnInit(): void {
    this.getVideoDevices();
  }

  getVideoDevices() {
    navigator.mediaDevices
      .enumerateDevices()
      .then(devices => {
        this.videoDevices = devices.filter(
          device => device.kind === 'videoinput'
        );

        // Automatically select the first available external camera if any
        if (this.videoDevices.length > 0) {
          // Determine the preferred video device
          this.selectedDevice = this.getPreferredDevice();

          this.startCamera();
        } else {
          console.error('No video input devices found.');
        }
      })
      .catch(error => {
        console.error('Error fetching video devices:', error);
      });
  }
  startCamera() {
    this.videoElement = document.getElementById('video') as HTMLVideoElement;
    const constraints = {
      video: {
        deviceId: this.selectedDevice
          ? { exact: this.selectedDevice }
          : undefined,
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(stream => {
        this.videoElement.srcObject = stream;
      })
      .catch(error => {
        console.error('Error accessing the camera:', error);
      });
  }

  captureImage() {
    this.canvasElement = document.createElement('canvas');
    this.canvasElement.width = this.videoElement.videoWidth;
    this.canvasElement.height = this.videoElement.videoHeight;
    const context = this.canvasElement.getContext('2d');
    context?.drawImage(this.videoElement, 0, 0);
    this.capturedImage = this.canvasElement.toDataURL('image/png');
  }

  useImage() {
    if (this.capturedImage) {
      const blob = this.dataURLToBlob(this.capturedImage);
      const file = new File([blob], 'captured-image.jpeg', {
        type: 'image/jpeg',
      });

      this.dialogRef.close(file); // Close modal and pass the File object
    }
  }

  dataURLToBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  closeModal() {
    const stream = this.videoElement.srcObject as MediaStream;
    const tracks = stream.getTracks();
    tracks.forEach(track => track.stop()); // Stop camera
    this.dialogRef.close(); // Close modal without using the image
  }

  getPreferredDevice(): string {
    if (this.videoDevices.length === 1) {
      // Only one device, use it
      return this.videoDevices[0].deviceId;
    }

    let OSName = '';

    if (navigator.appVersion.indexOf('Win') != -1) OSName = 'Windows';
    if (navigator.appVersion.indexOf('Mac') != -1) OSName = 'MacOS';

    if (OSName === 'Windows') {
      // Assume the first device is built-in and prioritize the next one
      return this.videoDevices[0]?.deviceId || this.videoDevices[1].deviceId;
    } else {
      // Assume the first device is built-in and prioritize the next one
      return this.videoDevices[1]?.deviceId || this.videoDevices[0].deviceId;
    }
  }
}
