'use strict'

var test = require('tape')
  , gulpMarkdownEquations = require('../lib')
  , File = require('vinyl')

test('processes a file',function(t) {

  var equations = {}
  var markdownFile, mdeq

  markdownFile = new File({
    path: "./test/sample.mdtex",
    contents: new Buffer("A parabola has the equation $[name=parabola] y = x^2$, while\n"+
                         "a hyperbola has the equation $[name=hyperbola] y = 1/x$")
  });

  mdeq = gulpMarkdownEquations()
  mdeq.write(markdownFile)
  mdeq.end()

  mdeq.on('data',function(file) {

    console.log('got:',file)
    if( file.extname !== '.tex' ) return
    console.log('file:',file.basename)
    equations.rewrite(file)('<img src="...">')
  })

  t.end()
})



