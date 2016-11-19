const path = require("path");

const anyFS = require("../source/index.js");

module.exports = {

    setUp: function(cb) {
        this.fs = anyFS(require("fs"));
        cb();
    },

    files: {

        "stats correctly": function(test) {
            this.fs
                .stat(path.resolve(__dirname, "./stat.spec.js"))
                .then(function(stat) {
                    test.strictEqual(stat.isFile(), true, "Stat should recognise target as a file");
                    test.strictEqual(stat.isDirectory(), false, "Stat should not recognise target as a directory");
                    test.ok(stat.size > 0, "Stat should contain a valid size");
                    test.ok(stat.mtime > 0, "Stat should contain a valid modification time");
                    test.strictEqual(stat.name, "stat.spec.js", "Stat could contain correct name");
                    test.done();
                });
        }

    },

    directories: {

        "stats correctly": function(test) {
            this.fs
                .stat(__dirname)
                .then(function(stat) {
                    test.strictEqual(stat.isFile(), false, "Stat should not recognise target as a file");
                    test.strictEqual(stat.isDirectory(), true, "Stat should recognise target as a directory");
                    test.strictEqual(stat.name, "test", "Stat could contain correct name");
                    test.done();
                });
        }

    }

};
