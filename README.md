# Any-fs
Abstract away any filesystem (NodeJS) instance to a smarter interface

## Purpose
Any-fs was designed to wrap filesystem interfaces like the following:

 * Node's [fs](https://nodejs.org/api/fs.html)
 * [WebDAV-fs](https://github.com/perry-mitchell/webdav-fs)
 * [Dropbox-fs](https://github.com/sallar/dropbox-fs) (v0.0.5 and up)

Into a common interface that provides a more intuitive syntax. Any-fs is designed to blindly take any of these systems and return a common API.

## Usage

### Node's fs
Usage with the built-in `fs` interface is the simplest use-case:

```javascript
const fs = require("fs");
const anyFs = require("any-fs");

const afs = anyFs(fs);

afs
    .readDirectory("/")
    .then(function(contents) {
        console.log(contents.pop());
        // returns something like:
        // {
        //    name: "filename.txt,
        //    isFile: Function,
        //    isDirectory: Function,
        // }
    });
```

This example returns an array if [stat](https://nodejs.org/api/fs.html#fs_class_fs_stats) objects.

### WebDAV-fs
Once WebDAV-fs has been setup with a remote location, it too can be wrapped by any-fs:

```javascript
const wfs = require("webdav-fs")(
    "http://example.com/webdav/",
    "username",
    "password"
);
const anyFs = require("any-fs");

const afs = anyFs(fs);
afs
    .readFile("/movie.mp4")
    .then(function(data) {
        // `data` is a Buffer
    });
```

## API
Any-fs supports a few handy commands.

### readDirectory(directoryPath[, options])
Read the contents of a directory, returning a Promise with an array of stats (refer to the stat output of the wrapped fs module).

| Parameter       | Type                      | Description                                         |
|-----------------|---------------------------|-----------------------------------------------------|
| directoryPath   | `String`                  | The path to scan                                    |
| options         | `String` or `Object`      | Encoding (string) or config options (object)        |

### readFile(filePath[, options])
Read the contents of a file, returning a Promise with a Buffer or string.

| Parameter       | Type                      | Description                                         |
|-----------------|---------------------------|-----------------------------------------------------|
| filePath        | `String`                  | The file to read                                    |
| options         | `String` or `Object`      | Encoding (string) or config options (object)        |

### stat(filePath)
Get statistics on a file or directory - returns a Promise with the stat object.

| Parameter       | Type                      | Description                                         |
|-----------------|---------------------------|-----------------------------------------------------|
| filePath        | `String`                  | The file or directory to check                      |
