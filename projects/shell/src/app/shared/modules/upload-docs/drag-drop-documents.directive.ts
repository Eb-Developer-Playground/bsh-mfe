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
  public drop(evt: {
    preventDefault: () => void;
    stopPropagation: () => void;
    dataTransfer: { files: any };
  }) {
    evt.preventDefault();
    evt.stopPropagation();
    const files = evt.dataTransfer.files;
    if (files.length > 0) {
      this.files.emit(files);
    }
  }
}
