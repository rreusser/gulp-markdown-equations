'use strict'

var name = require('../lib/compute-filename')
  , test = require('tape')

test('compute-filename: parameterizes the tex', function(t) {
  t.assert( name("y=x^2", {}).match(/yx2/) )
  t.end()
})

test('compute-filename: uses name over parameterized equation if name is provided', function(t) {
  t.assert( name("y=x^2", {name: 'equation'}).match(/equation/) )
  t.assert( ! name("y=x^2", {name: 'equation'}).match(/yx2/) )
  t.end()
})

test('compute-filename: appends a ten-character hash', function(t) {
  t.assert( name("y=x^2", {}).match(/-[a-zA-Z0-9]{10}\./) )
  t.end()
})

test('compute-filename: distinct equations have distinct filenames', function(t) {
  var n1 = name("y=x^2", {})
  var n2 = name("y=x^3", {})
  t.assert( n1 !== n2 )
  t.end()
})

test('compute-filename: distinct parameters yield distinct filenames', function(t) {
  var n1 = name("y=x^2", {margin: '10pt'})
  var n2 = name("y=x^2", {margin: '11pt'})
  t.assert( n1 !== n2 )
  t.end()
})

test('compute-filename: appends ".tex"', function(t) {
  var n1 = name("y=x^2", {margin: '10pt'})
  t.assert( n1.match(/\.tex$/) )
  t.end()
})
