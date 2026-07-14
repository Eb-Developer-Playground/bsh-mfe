import { Injectable } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root',
})
export class UIService {
  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry
  ) {}

  toBase64 = (file: any) =>
    new Promise<any>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let encoded = reader.result?.toString().replace(/^data:(.*,)?/, '');
        if (encoded && encoded.length % 4 > 0) {
          encoded += '='.repeat(4 - (encoded.length % 4));
        }
        resolve(encoded);
      };
      reader.onerror = error => reject(error);
    });

  resizeImage(file: File, maxSizeInBytes: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event: any) => {
          const img = new Image();

          img.onload = () => {
            let width = img.width;
            let height = img.height;
            let quality = 0.9; // Start with 90% quality
            const MIN_QUALITY = 0.1;
            const MIN_DIMENSION = 100; // Minimum width or height
            const MAX_ITERATIONS = 10;
            let iterations = 0;

              const resize = () => {
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                  reject(new Error("Failed to get canvas context"));
                  return;
                }
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                  canvas.toBlob(
                      (blob) => {
                          if (blob) {
                              if (blob.size <= maxSizeInBytes || iterations >= MAX_ITERATIONS) {
                                  const resizedFile = new File([blob], file.name, {
                                      type: file.type
                                  });
                                  resolve(resizedFile);
                              } else {
                                  // Reduce the image dimensions and quality, then try again
                                  width = Math.max(width * 0.9, MIN_DIMENSION);
                                  height = Math.max(height * 0.9, MIN_DIMENSION);
                                  quality = Math.max(quality - 0.1, MIN_QUALITY);
                                  iterations++;
                                  resize();
                              }
                          } else {
                              reject(new Error("Failed to generate image blob"));
                          }
                      },
                      file.type,
                      quality
                  );
              };

              resize();
          };

          img.onerror = (error) => {
              reject(error);
          };

          img.src = event.target.result;
      };

      reader.onerror = (error) => {
          reject(error);
      };

      reader.readAsDataURL(file);
    });
  }
}
