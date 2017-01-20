"use strict";

const path = require("path");
const pify = require("pify");

const FS_NATIVE = "fs";
const FS_DROPBOX = "dropbox-fs";
const FS_WEBDAV = "webdav-fs";

const TYPE_KEY = '@@fsType';

function __fixWebDAVFs(fsInterface) {
    let readdir = fsInterface.readdir;
    Object.assign(fsInterface, {
        readdir: (dirPath, mode, callback) => readdir(dirPath, callback, mode)
    });
}

function __fsIsNative(fsInterface) {
    try {
        let readdir = fsInterface.readdir.toString();
        return require("fs").readdir.toString() === readdir;
    } catch (err) {
        return false;
    }
}

function __processStatOutput(filePath, result) {
    let name = result.name || path.basename(filePath);
    return {
        name,
        path: path.resolve(path.dirname(filePath), name),
        isFile: () => result.isFile(),
        isDirectory: () => result.isDirectory(),
        size: result.size || 0
    };
}

function __resolveFsType(fsInterface) {
    if (fsInterface[TYPE_KEY]) {
        switch(fsInterface[TYPE_KEY]) {
            case FS_DROPBOX:
                /* falls-through */
            case FS_WEBDAV:
                return fsInterface[TYPE_KEY];

            default:
                throw new Error(`Invalid type identifier: ${fsInterface[TYPE_KEY]}`);
        }
    } else if (__fsIsNative(fsInterface)) {
        return FS_NATIVE;
    }
    throw new Error("Unrecognised fs interface");
}

/**
 * Directory contents result
 * @typedef {Object} DirectoryItem
 * @property {String} filename The filename
 * @property {String} type Whether it is a "file" or "directory"
 */

module.exports = function anyFS(fsInterface) {
    let fsType = __resolveFsType(fsInterface);
    if (fsType === FS_WEBDAV) {
        __fixWebDAVFs(fsInterface);
    }
    let promFs = pify(fsInterface);
    let adapter = {

        readDirectory: function readDirectory(dirPath, optionsOrEncoding) {
            let defaultOptions = {
                encoding: "utf8",
                mode: "stat"
            };
            let options = (typeof optionsOrEncoding === "string") ?
                Object.assign(defaultOptions, { encoding: optionsOrEncoding }) :
                Object.assign(defaultOptions, optionsOrEncoding || {});
            switch (fsType) {
                case FS_WEBDAV:
                    return promFs
                        .readdir(dirPath, options.mode)
                        .then(results => Promise.all(
                            results.map(result => __processStatOutput(
                                path.resolve(dirPath, result.name),
                                result
                            ))
                        ));

                case FS_DROPBOX: {
                    return promFs
                        .readdir(dirPath, options)
                        .then(results => Promise.all(
                            results.map(result => __processStatOutput(
                                path.resolve(dirPath, result.name),
                                result
                            ))
                        ));
                }

                case FS_NATIVE:
                    /* falls-through */
                default: {
                    return promFs
                        // no options, as Node v5.x.x and earlier didn't support it:
                        //  https://nodejs.org/docs/v5.12.0/api/fs.html#fs_fs_readdir_path_callback
                        .readdir(dirPath)
                        .then(function(results) {
                            if (options.mode === "stat") {
                                return Promise.all(results.map(item => adapter.stat(path.resolve(dirPath, item))));
                            }
                            return results;
                        });
                }
            }
        },

        readFile: function(filePath, optionsOrEncoding) {
            let defaultOptions = {
                encoding: null
            };
            let options = (typeof optionsOrEncoding === "string") ?
                Object.assign(defaultOptions, { encoding: optionsOrEncoding }) :
                Object.assign(defaultOptions, optionsOrEncoding || {});
            switch (fsType) {
                case FS_WEBDAV:
                    let encoding = (options.encoding === "utf8") ? "text" : "binary";
                    return promFs.readFile(filePath, encoding);
                case FS_DROPBOX:
                    /* falls-through */
                case FS_NATIVE:
                    /* falls-through */
                default: {
                    return promFs.readFile(filePath, options);
                }
            }
        },

        stat: function stat(filePath) {
            if (fsType === FS_NATIVE) {
                return promFs.stat(filePath).then(res => __processStatOutput(filePath, res));
            }
            return (new Promise(function call_stat(resolve, reject) {
                fsInterface.stat(filePath, function statCallback(err, res) {
                    if (err) {
                        return reject(err);
                    }
                    resolve(res);
                });
            })).then(res => __processStatOutput(filePath, res));
        }

    };

    return adapter;
};
