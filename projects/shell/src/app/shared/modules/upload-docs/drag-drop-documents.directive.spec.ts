import { DragDropDocumentsDirective } from '../../directives/drag-drop-documents.directive';

describe('DragDropDocumentsDirective', () => {
  let pipe: DragDropDocumentsDirective;

  beforeEach(() => {
    pipe = new DragDropDocumentsDirective();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });
  // Prevents default behavior of the event
  it('should prevent default behavior of the event when drop event occurs', () => {
    const evt = {
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      dataTransfer: { files: [] },
    };
    pipe.drop(evt);
    expect(evt.preventDefault).toHaveBeenCalled();
  });
});
