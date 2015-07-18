'use strict'

var test = require('tape')
  , transformer = require('../lib')
  , File = require('vinyl')

test('processes a file',function(t) {

  var markdownFile, extractor

  markdownFile = new File({
    path: "./test/sample.mdtex",
    contents: new Buffer("A parabola has the equation $y = x^2$, while\n"+
                         "a hyperbola has the equation $y = 1/x$")
  });

  extractor = transformer()
  extractor.write(markdownFile)
  extractor.end()

  extractor.on('data',console.log)

  t.end()
})



