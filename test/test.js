'use strict'

var test = require('tape')
  , transformer = require('../lib')
  , File = require('vinyl')

require('./preprocessor')
require('./templator')

test('processes a file',function(t) {

  var equations = {}
  var markdownFile, extractor

  markdownFile = new File({
    path: "./test/sample.mdtex",
    contents: new Buffer("A parabola has the equation $[name=parabola] y = x^2$, while\n"+
                         "a hyperbola has the equation $[name=hyperbola] y = 1/x$")
  });

  extractor =
  extractor.write(markdownFile)
  extractor.end()

  extractor.on('data',function(file) {
    if( file.extname !== '.tex' ) return
    console.log('file:',file.basename)
    equations.rewrite(file)('<img src="...">')
  })

  t.end()
})



