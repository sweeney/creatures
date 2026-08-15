#!/usr/bin/env node
// Run the web layer's tests.
//
//     node web/test.js              everything
//     node web/test.js constants    only matching names
//
// These check the app's own constants against the artefacts in original/.
// They are separate from core/test.js because the dependency runs one way:
// web may lean on core -- including its test harness -- and core never leans
// on web. For the interface itself, see uicheck.js, which drives a browser.
'use strict';

var fs = require('fs');
var path = require('path');
var H = require('../core/harness.js');

var dir = path.join(__dirname, 'tests');
fs.readdirSync(dir).filter(function (f) {
  return /\.test\.js$/.test(f);
}).sort().forEach(function (f) {
  require(path.join(dir, f));
});

console.log('creatures web\n');
H.run();
