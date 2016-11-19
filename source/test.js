var anyFS = require("./index.js")(require("fs"));

console.log(anyFS.readDirectory("."));
