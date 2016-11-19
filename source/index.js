const path = require("path");

function __fsIsNative(fsInterface) {
    let readdir = fsInterface.readdir.toString();
    // return /\[native code\]/.test(readdir);
    return require("fs").readdir.toString() === readdir;
}

// Taken from: http://stackoverflow.com/a/9924463/966338
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
var ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
  var fnStr = func.toString().replace(STRIP_COMMENTS, '');
  var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
  if(result === null)
     result = [];
  return result;
}

/**
 * Directory contents result
 * @typedef {Object} DirectoryItem
 * @property {String} filename The filename
 * @property {String} type Whether it is a "file" or "directory"
 */

module.exports = function anyFS(fsInterface) {

    let adapter = {

        readDirectory: function readDirectory(dirPath, optionsOrEncoding) {
            let targetFn = fsInterface.readdir,
                params = getParamNames(targetFn);
            let handler = function readdirCallback(resolve, reject, err, results) {
                if (err) {
                    reject(err);
                } else {
                    if (__fsIsNative(fsInterface)) {
                        Promise
                            .all(results.map(function(item) {
                                return adapter.stat(path.resolve(dirPath, item));
                            }))
                            .then(resolve, reject);
                    } else {
                        resolve(results);
                    }
                }
            };
            return new Promise(function call_readdir(resolve, reject) {
                if (/^(opts|options)/i.test(params[1])) {
                    // either node's fs or another interface that supports options
                    let lastParam = params.pop();
                    if (/^mode/i.test(lastParam)) {
                        // using mode
                        targetFn(dirPath, optionsOrEncoding, (err, results) => handler(resolve, reject, err, results), "stat");
                    } else {
                        // no mode param
                        targetFn(dirPath, optionsOrEncoding, (err, results) => handler(resolve, reject, err, results));
                    }
                } else {
                    let lastParam = params.pop();
                    if (/^mode/i.test(lastParam)) {
                        // using mode
                        targetFn(dirPath, (err, results) => handler(resolve, reject, err, results), "stat");
                    } else {
                        // no mode param
                        targetFn(dirPath, (err, results) => handler(resolve, reject, err, results));
                    }
                }
            });
        },

        readFile: function readFile(filePath, optionsOrEncoding) {

        },

        stat: function stat(filePath) {
            return new Promise(function call_stat(resolve, reject) {
                fsInterface.stat(filePath, function statCallback(err, res) {
                    if (err) {
                        return reject(err);
                    }
                    if (!res.name) {
                        res.name = path.basename(filePath);
                    }
                    resolve(res);
                });
            });
        }

    };

    return adapter;
};
