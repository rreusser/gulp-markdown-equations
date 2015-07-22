'use strict'

var test = require('tape')
  , extract = require('../preprocessor/default')
  , tapSpec = require('tap-spec')

test.createStream()
  .pipe(tapSpec())
  .pipe(process.stdout)

test('preprocessor: works without params: "y=7"',function(t) {
  var parsed = extract('[]y=7')
  t.deepEqual( parsed.content, 'y=7', 'content = "y=7"')
  t.deepEqual( parsed.params, {}, 'params = ' + JSON.stringify({}) )
  t.end()
})

test('preprocessor: extracts a parameter from a string: "[width=200][name=some equation]y=7"',function(t) {
  var parsed = extract('[width=200][name=some equation]y=7')
  t.deepEqual( parsed.content, 'y=7', 'content = "y=7"')
  t.deepEqual( parsed.params, {width: '200', name: 'some equation'}, 'params = ' + JSON.stringify({width: '200', name: 'some equation'}) )
  t.end()
})

test('preprocessor: a leading space yields no parameters: " [width=200][name=some equation]y=7"',function(t) {
  var parsed = extract(' [width=200][name=some equation]y=7')
  t.deepEqual( parsed.content, ' [width=200][name=some equation]y=7', 'content = " [width=200][name=some equation]y=7"')
  t.deepEqual( parsed.params, {}, 'params = ' + JSON.stringify({}) )
  t.end()
})

test('preprocessor: allows escaped hashes: "[width=\\[200\\]][name=some equation]y=7"',function(t) {
  var parsed = extract('[width=\\[200\\]][name=some equation]y=7')
  t.deepEqual( parsed.content, 'y=7', 'content = "y=7"')
  t.deepEqual( parsed.params, {width: '[200]', name: 'some equation'}, 'params = ' + JSON.stringify({width: '[200]', name: 'some equation'}) )
  t.end()
})

test('preprocessor: allows bare params: "[displaystyle]y=7"',function(t) {
  var parsed = extract('[displaystyle]y=7')
  t.deepEqual( parsed.content, 'y=7', 'content = "y=7"')
  t.deepEqual( parsed.params, {displaystyle: true}, 'params = ' + JSON.stringify({displaystyle:true}) )
  t.end()
})

test('preprocessor: allows empty hashes: "[]y=7"',function(t) {
  var parsed = extract('[]y=7')
  t.deepEqual( parsed.content, 'y=7', 'content = "y=7"')
  t.deepEqual( parsed.params, {}, 'params = ' + JSON.stringify({}) )
  t.end()
})


test('preprocessor: handles hashes with a single-character value: "[name=x]y=7"',function(t) {
  var parsed = extract('[name=x]y=7')
  t.deepEqual( parsed.content, 'y=7', 'content = "y=7"')
  t.deepEqual( parsed.params, {name: 'x'}, 'params = ' + JSON.stringify({name: 'x'}) )
  t.end()
})

