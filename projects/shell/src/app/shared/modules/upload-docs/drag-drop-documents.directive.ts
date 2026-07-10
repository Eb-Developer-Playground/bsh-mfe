import { Directive, EventEmitter, Output } from '@angular/core';

interface FileHandle {
  file: File;
}

@Directive({
  selector: '[appDragDropDocuments]',
  host: {
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'onDrop($event)',
  },
})

export class DragDropDocumentsDirective {
  @Output() files: EventEmitter<FileHandle[]> = new EventEmitter();

  constructor() {}

  public onDragOver(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  public onDragLeave(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  public onDrop(evt: Event) {
    evt.preventDefault();
    evt.stopPropagation();
    const dragEvent = evt as DragEvent;
    const files = dragEvent.dataTransfer?.files;
    if (files && files.length > 0) {
      const fileHandles: FileHandle[] = Array.from(files).map(file => ({ file }));
      this.files.emit(fileHandles);
    }
  }
}
