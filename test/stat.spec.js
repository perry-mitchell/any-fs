const fs = require("fs");
const path = require("path");
const anyFs = require("../source/index.js");

const TEST_IMAGE = path.resolve(__dirname, "./resources/nodejs.png");
const TEST_FOLDER = path.resolve(__dirname, "./resources");

describe("stat", function() {

    describe("using 'fs'", function() {

        beforeEach(function() {
            this.fs = anyFs(fs);
        });

        it("returns file stat with name and path", function() {
            return this.fs.stat(TEST_IMAGE).then(function(stat) {
                expect(stat).to.have.property("name", "nodejs.png");
                expect(stat).to.have.property("path", TEST_IMAGE);
            });
        });

        it("returns file stat with correct file/directory status", function() {
            return this.fs.stat(TEST_IMAGE).then(function(stat) {
                expect(stat.isFile()).to.be.true;
                expect(stat.isDirectory()).to.be.false;
            });
        });

        it("returns directory stat with correct file/directory status", function() {
            return this.fs.stat(TEST_FOLDER).then(function(stat) {
                expect(stat.isFile()).to.be.false;
                expect(stat.isDirectory()).to.be.true;
            });
        });

        it("returns correct sizes", function() {
            return Promise
                .all([
                    this.fs.stat(TEST_IMAGE).then(stat => stat.size),
                    this.fs.stat(TEST_FOLDER).then(stat => stat.size)
                ])
                .then(function(sizes) {
                    expect(sizes[0]).to.equal(11471);
                    expect(sizes[1]).to.equal(136);
                });
        });

        it("returns file stat correct timestamp", function() {
            return this.fs.stat(TEST_IMAGE).then(function(stat) {
                expect(
                    (new Date(stat.mtime)).getTime()
                ).to.equal(1494076047000);
            });
        });

    });

});
