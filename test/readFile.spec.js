const path = require("path");
const fs = require("fs");

const anyFS = require("../source/index.js");

// TEST COMMENT

module.exports = {

    setUp: function(cb) {
        this.fs = anyFS(fs);
        this.testBuffer = new Buffer([1, 0, 5, 9, 2, 1, 7]);
        fs.writeFileSync(path.resolve(__dirname, "./test.dat"), this.testBuffer);
        cb();
    },

    tearDown: function(cb) {
        fs.unlinkSync(path.resolve(__dirname, "./test.dat"));
        cb();
    },

    text: {

        "reads correctly": function(test) {
            this.fs
                .readFile(path.resolve(__dirname, "./readFile.spec.js"))
                .then(function(data) {
                    test.ok(data.indexOf("// TEST COMMENT") >= 0, "File contents should be read correctly");
                    test.done();
                });
        }

    },

    binary: {

        "reads correctly": function(test) {
            this.fs
                .readFile(path.resolve(__dirname, "./test.dat"))
                .then((data) => {
                    test.ok(data.equals(this.testBuffer), "File contents should be read correctly");
                    test.done();
                });
        }

    }

};
