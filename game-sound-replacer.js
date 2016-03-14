/**
 * Created by Jonas on 12.03.2016.
 */

var fs = require("fs");
var path = require("path");
var filesize = require("filesize");
var argv = require('minimist')(process.argv.splice(2));
var Chance = require("chance");

var SEED = Date.now();
if (argv.hasOwnProperty("s"))
    SEED = argv["s"];

var chance = new Chance(SEED);

const INPUT_FOLDER_NAME = argv._[0] || argv["i"] || "input";
const OUTPUT_FOLDER_NAME = argv._[1] || argv["o"] || "sound";
const ARRANGE_SCRIPT_NAME = argv["b"] || "arrange.bat";

var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};
var walkDirOnly = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    results.push(file);
                    walkDirOnly(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

var inputFiles = [];
var outputFiles = [];
var outputDirectoryTree = [];

walk(OUTPUT_FOLDER_NAME, function (err, results) {
    if (err) {
        console.log(err);
        return;
    }
    outputFiles = results;
    walk(INPUT_FOLDER_NAME, function (err, results) {
        if (err) {
            console.log(err);
            return;
        }
        inputFiles = results;
        walkDirOnly(OUTPUT_FOLDER_NAME, function (err, results) {
            if (err) {
                console.log(err);
                return;
            }
            outputDirectoryTree = results;
            arrangeGen();
        });
    });
});

function sanitizePath(p) {
    return path.relative(__dirname, p);
}

function arrangeGen() {
    console.log("Found " + inputFiles.length + " input sounds.\nMapping " + outputFiles.length + " output files to library.\n");

    var arrangeScriptStream = fs.createWriteStream(ARRANGE_SCRIPT_NAME);

    arrangeScriptStream.write("@echo off\r\n");
    arrangeScriptStream.write("md \"" + OUTPUT_FOLDER_NAME + "\"\r\n");

    outputDirectoryTree.forEach(function (outputFolder) {
        outputFolder = sanitizePath(outputFolder);

        arrangeScriptStream.write("md \"" + outputFolder + "\"\r\n");
    });

    outputFiles.forEach(function (outputFile) {
        outputFile = sanitizePath(outputFile);
        var pick = sanitizePath(chance.pickone(inputFiles));

        console.log(outputFile + " -> " + pick);
        arrangeScriptStream.write("copy /Y \"" + pick + "\" \"" + outputFile + "\"\r\n");
    });

    arrangeScriptStream.write("echo Seed used to generate this script: " + SEED + "\r\n");

    arrangeScriptStream.end(function () {
        console.log("All done! Wrote " + ARRANGE_SCRIPT_NAME + " (" + filesize(arrangeScriptStream.bytesWritten) + ")");
        console.log("Seed: " + SEED);
    });
}