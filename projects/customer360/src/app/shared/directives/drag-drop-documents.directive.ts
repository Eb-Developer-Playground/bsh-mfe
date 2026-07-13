import { Directive, EventEmitter, HostListener, Output } from '@angular/core';

interface FileHandle {
  file: File;
}

@Directive({
  selector: '[appDragDropDocuments]',
})
export class DragDropDocumentsDirective {
  @Output() files: EventEmitter<FileHandle[]> = new EventEmitter();

  constructor() {}

  @HostListener('dragover', ['$event'])
  public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('dragleave', ['$event'])
  public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('drop', ['$event'])
  public drop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileHandles: FileHandle[] = Array.from(files).map(file => ({ file }));
      this.files.emit(fileHandles);
    }
  }
}
