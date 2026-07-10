import { FileSizePipe } from './file-size.pipe';

describe('fileSize', () => {
  let pipe: FileSizePipe;

  beforeEach(() => {
    pipe = new FileSizePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return 1 KB when given 1024 as input', () => {
    const result = pipe.transform(1024);
    expect(result).toEqual('1.00 KB');
  });

  it('should return 1.5 MB when given 1572864 as input', () => {
    const result = pipe.transform(1572864);
    expect(result).toEqual('1.50 MB');
  });

  it('should return ? when given NaN as input', () => {
    const result = pipe.transform(NaN);
    expect(result).toEqual('?');
  });
});
