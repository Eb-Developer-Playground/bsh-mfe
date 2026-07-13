"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var file_size_pipe_1 = require("./file-size.pipe");
describe('fileSize', function () {
    var pipe;
    beforeEach(function () {
        pipe = new file_size_pipe_1.FileSizePipe();
    });
    it('should create', function () {
        expect(pipe).toBeTruthy();
    });
    it('should return 1 KB when given 1024 as input', function () {
        var result = pipe.transform(1024);
        expect(result).toEqual('1.00 KB');
    });
    it('should return 1.5 MB when given 1572864 as input', function () {
        var result = pipe.transform(1572864);
        expect(result).toEqual('1.50 MB');
    });
    it('should return ? when given NaN as input', function () {
        var result = pipe.transform(NaN);
        expect(result).toEqual('?');
    });
});
