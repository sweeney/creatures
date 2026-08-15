// A minimal test harness. No dependencies, no framework.
//
//     node test.js            run everything
//     node test.js movement   run only tests whose name matches

'use strict';

var tests = [];
var only = process.argv[2];

function test(name, fn) { tests.push({ name: name, fn: fn }); }

function fail(msg) { throw new Error(msg); }

var assert = {
  ok: function (v, msg) { if (!v) fail(msg || 'expected truthy, got ' + v); },
  equal: function (a, b, msg) {
    if (a !== b) fail((msg ? msg + ': ' : '') + 'expected ' + b + ', got ' + a);
  },
  deepEqual: function (a, b, msg) {
    var sa = JSON.stringify(a), sb = JSON.stringify(b);
    if (sa !== sb) fail((msg ? msg + ': ' : '') + 'expected ' + sb + ', got ' + sa);
  },
  throws: function (fn, msg) {
    try { fn(); } catch (e) { return; }
    fail(msg || 'expected a throw');
  },
};

// An RNG that returns exactly the values it is given, in order. Lets a
// stochastic model be asserted exactly rather than statistically.
function ScriptedRandom(values) {
  this.values = values.slice();
  this.i = 0;
}
ScriptedRandom.prototype.random = function () {
  if (this.i >= this.values.length) {
    throw new Error('ScriptedRandom ran out after ' + this.i + ' draws');
  }
  return this.values[this.i++];
};
ScriptedRandom.prototype.drawsUsed = function () { return this.i; };

// The random() value that makes randomN(rng, n) return exactly k (1..n).
function forRandomN(k, n) { return (k - 1) / n + 0.5 / n; }

// A value that always passes `random() < p` for any p > 0, and one that never does.
var ALWAYS = 0;
var NEVER = 0.9999999;

// Test names are written "<suite>: <what it checks>", so the suite is
// recoverable from the name and no test file has to declare it.
function suiteOf(name) {
  var i = name.indexOf(':');
  return i === -1 ? '(ungrouped)' : name.slice(0, i);
}

function run() {
  var pass = 0, failed = [], results = [];
  tests.forEach(function (t) {
    if (only && t.name.indexOf(only) === -1) return;
    var t0 = process.hrtime.bigint();
    var row = { suite: suiteOf(t.name), name: t.name, ok: true, ms: 0 };
    try {
      t.fn();
      pass++;
      console.log('  ok   ' + t.name);
    } catch (e) {
      row.ok = false;
      row.error = e.message;
      failed.push({ name: t.name, err: e });
      console.log('  FAIL ' + t.name);
      console.log('         ' + e.message);
    }
    row.ms = Number(process.hrtime.bigint() - t0) / 1e6;
    results.push(row);
  });
  console.log('\n' + pass + ' passed, ' + failed.length + ' failed');

  // For report.js and CI. Off unless asked for, so a plain run is unchanged.
  if (process.env.CREATURES_RESULTS) {
    require('fs').writeFileSync(process.env.CREATURES_RESULTS,
      JSON.stringify({ passed: pass, failed: failed.length, tests: results }, null, 1));
  }
  process.exit(failed.length ? 1 : 0);
}

module.exports = {
  test: test, assert: assert, run: run,
  ScriptedRandom: ScriptedRandom, forRandomN: forRandomN,
  ALWAYS: ALWAYS, NEVER: NEVER,
};
