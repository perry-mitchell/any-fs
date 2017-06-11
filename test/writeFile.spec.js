const fs = require("fs");
const path = require("path");
const pify = require("pify");
const rmrf = require("rimraf");
const anyFs = require("../source/index.js");

const fileToBuffer = pify(fs.readFile);
const rimraf = pify(rmrf);

const TEST_IMAGE = path.resolve(__dirname, "./resources/nodejs.png");

describe("writeFile", function() {

    describe("using 'fs'", function() {

        beforeEach(function() {
            this.fs = anyFs(fs);
        });

        it("writes binary (default) files", function() {
            var afs = this.fs,
                originalData;
            return fileToBuffer(TEST_IMAGE)
                .then(function(original) {
                    originalData = original;
                    return afs.writeFile("./test.bin", original);
                })
                .then(function() {
                    return fileToBuffer("./test.bin");
                })
                .then(function(final) {
                    expect(originalData.equals(final)).to.be.true;
                    return rimraf("./test.bin");
                });
        });

    });

});
