/**
 * Created by Jonas on 12.03.2016.
 */

var fs = require("graceful-fs");
var path = require("path");
var argv = require('minimist')(process.argv.splice(2));
var Chance = require("chance");
var glob = require("glob");

var SEED = Date.now();
if (argv.hasOwnProperty("s"))
    SEED = argv["s"];

var chance = new Chance(SEED);

const OUTPUT_GLOB_PATTERN = argv["o"] || "output/**/*.*";
const INPUT_GLOB_PATTERN = argv["i"] || "input/**/*.*";
const FILE_COPY_BATCH_SIZE = 1000;

var inputFiles = [];
var outputFiles = [];
var outputFilesEmpty = false;

glob(INPUT_GLOB_PATTERN, function (err, files) {
    if (err) {
        console.log(err);
        process.abort();
    }
    inputFiles = files.length ? files : [INPUT_GLOB_PATTERN];
    glob(OUTPUT_GLOB_PATTERN, function (err, files) {
        if (err) {
            console.log(err);
            process.abort();
        }
        outputFiles = files.length ? files : [OUTPUT_GLOB_PATTERN];
        startCopying();
    })
});

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function (err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function (err) {
        done(err);
    });
    wr.on("close", function () {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}

function copyNext(e) {
    if (e) {
        console.log(e);
    } else if (outputFiles.length > 0) {
        var inputFile = chance.pickone(inputFiles);
        var outputFile = outputFiles.splice(0, 1)[0];
        console.log(inputFile + " -> " + outputFile);
        copyFile(inputFile, outputFile, copyNext);
    } else if (!outputFilesEmpty) {
        console.log("Seed: " + SEED);
        outputFilesEmpty = true;
    }
}

function startCopying() {
    console.log(inputFiles.length + " input files, " + outputFiles.length + " output files. Copying...");
    //console.log(inputFiles, outputFiles);
    var batch = outputFiles.splice(0, FILE_COPY_BATCH_SIZE);
    batch.forEach(function (outputFile) {
        var inputFile = chance.pickone(inputFiles);
        console.log(inputFile + " -> " + outputFile);
        copyFile(inputFile, outputFile, copyNext);
    });
}