'use strict'

var test = require('tape')
  , wrap = require('../templator/default')


test('templator: inserts the equation',function(t) {
  var re = /x\+y/m
  t.assert( re.test(wrap('x+y')), 'Contains the equation')
  t.end()
})

test('templator: sets the font size',function(t) {
  var re = /10pt/m
  t.assert( re.test(wrap('x+y', {fontSize: '10pt'})), 'Contains the font size')
  t.end()
})

test('templator: sets the margin',function(t) {
  var re = /12345pt/m
  t.assert( re.test(wrap('x+y', {margin: '12345pt'})), 'sets the margin')
  t.end()
})

test('templator: sets displaystyle=false',function(t) {
  var re = /\\displaystyle/m
  t.assert( ! re.test(wrap('x+y',{display:false})), 'sets displaystyle=false')
  t.end()
})

test('templator: sets displaystyle=true',function(t) {
  var re = /\\displaystyle/m
  t.assert( re.test(wrap('x+y',{display:true})), 'sets displaystyle=false')
  t.end()
})
