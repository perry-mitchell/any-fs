const fs = require("fs");
const anyFs = require("../source/index.js");

describe("readDirectory", function() {

    describe("using 'fs'", function() {

        beforeEach(function() {
            this.fs = anyFs(fs);
        });

        it("returns regular contents of directory", function() {
            return this.fs
                .readDirectory(__dirname, { mode: "node" })
                .then(function(contents) {
                    expect(contents).to.contain("readDirectory.spec.js");
                });
        });

        it("returns stat'd contents of directory", function() {
            return this.fs
                .readDirectory(__dirname)
                .then(function(contents) {
                    expect(contents.some(stat => stat.name === "readDirectory.spec.js")).to.be.true;
                });
        });

    });

});
