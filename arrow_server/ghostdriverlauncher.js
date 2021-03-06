#!/usr/bin/env node
/*
 * Copyright (c) 2012, Yahoo! Inc.  All rights reserved.
 * Copyrights licensed under the New BSD License.
 * See the accompanying LICENSE file for terms.
 */

/*jslint forin:true sub:true anon:true sloppy:true stupid:true nomen:true node:true continue:true*/

var childProcess = require("child_process");
var fs = require("fs");
var ghostPort = process.argv[2];
var arrowHost = process.argv[3];
var path = require("path");

global.appRoot = path.resolve(__dirname, "..");

//console.log(ghostPort + ":" + arrowHost );

process.chdir(__dirname + "/../ghostdriver/src");
var child = childProcess.spawn("phantomjs", ["main.js", ghostPort]);
var initPhantom = false;

child.stdout.on("data", function (data) {
    var pjUrl;
    console.log(data.toString());
    if (!initPhantom) {
        //console.log("Writing arrow_phantom_server.status");
        pjUrl = "http://" + arrowHost + ":" + ghostPort;
        fs.writeFileSync(global.appRoot + "/tmp/arrow_phantom_server.status", pjUrl);
        initPhantom = true;
    }
});

child.stderr.on("data", function (data) {
    console.error(data.toString());
});