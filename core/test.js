#!/usr/bin/env node
// Run the core's tests.
//
//     node test.js              everything
//     node test.js AnimalPass   only matching names
'use strict';

var fs = require('fs');
var path = require('path');
var H = require('./harness.js');

var dir = path.join(__dirname, 'tests');
fs.readdirSync(dir).filter(function (f) {
  return /\.test\.js$/.test(f);
}).sort().forEach(function (f) {
  require(path.join(dir, f));
});

console.log('creatures core\n');
H.run();
