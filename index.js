'use strict';

var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');

var PLUGIN_NAME = 'gulp-tsc-optimize-imports';

module.exports = function () {

    function optimizeImports(file, enc, cb) {

        var fileContentString = file.contents.toString('utf8');
        var fileName = path.basename(file.path);

        var arrayOfLines = fileContentString.split("\n");
        arrayOfLines.forEach(function (line, i) {
            var lineNumber = i + 1;

            if (line.match(/^(\s*)import\b/)) {
                var withoutImport = line.split("import")[1];
                var separatedByEquals = withoutImport.split("=");

                var beforeEquals = separatedByEquals[0];
                var afterEquals = separatedByEquals[1];

                //get Import Name
                var importName = beforeEquals;

                //get Class Name
                afterEquals = afterEquals.replace(";", "");
                var indexOfLastPoint = afterEquals.lastIndexOf(".");
                var className = afterEquals.substring(indexOfLastPoint + 1);

                //check if className and importName are equal
                if (importName === className) {
                    //check if the import is used in the file -> that means more than 2 times
                    var amountOfUsingImport = (fileContentString.match(new RegExp(importName + '\\b', 'g')) || []).length;
                    if (amountOfUsingImport === 2) {
                        gutil.log(gutil.colors.red("[unused import >>> " + fileName + "]"), fileName + ":" + lineNumber);
                    }
                } else {
                    gutil.log(gutil.colors.yellow("[import name difference >>> " + importName + " <-> " + className + "]", fileName + ":" + lineNumber));
                }
            }
        });

        cb(null, file);
    }

    return through.obj(optimizeImports);
};