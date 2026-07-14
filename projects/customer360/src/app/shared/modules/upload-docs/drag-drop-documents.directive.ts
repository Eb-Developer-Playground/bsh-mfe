import { Directive, EventEmitter, Output } from '@angular/core';

interface FileHandle {
  file: File;
}

@Directive({
  selector: '[appDragDropDocuments]',
  standalone: true,
  host: {
    '(dragover)': 'onDragOver($event)',
    '(dragleave)': 'onDragLeave($event)',
    '(drop)': 'drop($event)',
  },
})
export class DragDropDocumentsDirective {
  @Output() files: EventEmitter<FileHandle[]> = new EventEmitter();

  public onDragOver(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  public onDragLeave(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  public drop(evt: DragEvent) {
    evt.preventDefault();
    evt.stopPropagation();
    const files = evt.dataTransfer?.files;
    if (files && files.length > 0) {
      this.files.emit(files as any);
    }
  }
}
