const anyFS = require("../source/index.js");

var fs_optionsOnly = {
    readdir: function(dir, options, callback) {
        setTimeout(function() {
            callback(null, [dir, options]);
        }, 0);
    }
};

var fs_modeOnly = {
    readdir: function(dir, callback, mode) {
        setTimeout(function() {
            callback(null, [dir, mode]);
        }, 0);
    }
};

var fs_modeAndOptions = {
    readdir: function(dir, options, callback, mode) {
        setTimeout(function() {
            callback(null, [dir, options, mode]);
        }, 0);
    }
};

var fs_noExtra = {
    readdir: function(dir, callback) {
        setTimeout(function() {
            callback(null, [dir]);
        }, 0);
    }
};

function fakeStat(fsInterface) {
    return Object.assign({}, fsInterface, {
        stat: function(filePath, callback) {
            setTimeout(function() {
                callback(null, {
                    isFile: () => true,
                    isDirectory: () => false,
                    size: 496
                });
            }, 0);
        }
    });
}

function throwErr(err) {
    console.error(err);
}

module.exports = {

    setUp: function(cb) {
        cb();
    },

    tearDown: function(cb) {
        cb();
    },

    recognition: {

        "no extra params": function(test) {
            let fs = anyFS(fakeStat(fs_noExtra));
            fs.readDirectory("abc", "utf8")
                .then(function(result) {
                    test.strictEqual(result[0], "abc", "Result should contain the path");
                    test.strictEqual(result.length, 1, "Only 1 parameter should be returned");
                    test.done(); 
                })
                .catch(err => throwErr(err));
        },

        "mode only": function(test) {
            let fs = anyFS(fakeStat(fs_modeOnly));
            fs.readDirectory("abc", "utf8")
                .then(function(result) {
                    test.strictEqual(result[0], "abc", "Result should contain the path");
                    test.strictEqual(result[1], "stat", "Result should contain the mode 'stat'");
                    test.strictEqual(result.length, 2, "Only 2 parameters should be returned");
                    test.done(); 
                })
                .catch(err => throwErr(err));
        },

        "options only": function(test) {
            let fs = anyFS(fakeStat(fs_optionsOnly));
            fs.readDirectory("abc", "utf8")
                .then(function(result) {
                    test.strictEqual(result[0], "abc", "Result should contain the path");
                    test.strictEqual(result[1], "utf8", "Result should contain the options-encoding 'utf8'");
                    test.strictEqual(result.length, 2, "Only 2 parameters should be returned");
                    test.done(); 
                })
                .catch(err => throwErr(err));
        },

        "options and mode": function(test) {
            let fs = anyFS(fakeStat(fs_modeAndOptions));
            fs.readDirectory("abc", "utf8")
                .then(function(result) {
                    test.strictEqual(result[0], "abc", "Result should contain the path");
                    test.strictEqual(result[1], "utf8", "Result should contain the options-encoding 'utf8'");
                    test.strictEqual(result[2], "stat", "Result should contain the mode 'stat'");
                    test.strictEqual(result.length, 3, "3 parameters should be returned");
                    test.done(); 
                })
                .catch(err => throwErr(err));
        }

    },

    usingNodeFS: {

        "gets local file stats": function(test) {
            let fs = anyFS(require("fs"));
            fs.readDirectory(__dirname)
                .then(function(results) {
                    test.ok(results.length > 0, "Should return list of items");
                    test.ok(results.some(function(result) {
                        return result.name === "readDirectory.spec.js";
                    }), "Should contain readDirectory.spec.js");
                    test.done();
                })
                .catch(err => throwErr(err));
        }

    }

};
