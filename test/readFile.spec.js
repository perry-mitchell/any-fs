const fs = require("fs");
const path = require("path");
const anyFs = require("../source/index.js");

const TEST_IMAGE = path.resolve(__dirname, "./resources/nodejs.png");
const TEST_TEXT = path.resolve(__dirname, "./resources/test.txt");

describe("readFile", function() {

    describe("using 'fs'", function() {

        beforeEach(function() {
            this.fs = anyFs(fs);
        });

        it("reads binary (default) files", function() {
            return this.fs
                .readFile(TEST_IMAGE)
                .then(function(data) {
                    expect(data).to.have.lengthOf(11471);
                    expect(data).to.be.an.instanceOf(Buffer);
                });
        });

        it("reads binary files", function() {
            return this.fs
                .readFile(TEST_IMAGE, { encoding: null })
                .then(function(data) {
                    expect(data).to.have.lengthOf(11471);
                    expect(data).to.be.an.instanceOf(Buffer);
                });
        });

        it("reads text files", function() {
            return this.fs
                .readFile(TEST_TEXT, { encoding: "utf8" })
                .then(function(data) {
                    expect(data).to.equal("This is a test text file.")
                });
        });

        it("supports options as encoding string", function() {
            return this.fs
                .readFile(TEST_TEXT, "utf8")
                .then(function(data) {
                    expect(data).to.equal("This is a test text file.")
                });
        });

    });

});
