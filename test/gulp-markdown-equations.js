'use strict'

var test = require('tape')
  , gulpMarkdownEquations = require('../lib')
  , tap = require('gulp-tap')
  , File = require('vinyl')
  , fixtures = require('./fixtures')

//test.createStream().pipe(require('tap-spec')()).pipe(process.stdout);

function testBehavior(input, defaults, eqCallback, mdCallback) {

  var mdeq = gulpMarkdownEquations({defaults: defaults})

  mdeq.write(new File({ path: 'sample.mdtex', contents: input }))
  mdeq.end()

  mdeq.pipe(tap(function(file) {
    if( file.contents === null ) return
    if( file.basename.match(/\.md$/) ) {
      mdCallback.bind(file)()
    } else {
      mdeq.complete(file,eqCallback)
    }
  }))

  return mdeq
}



test('transforms a file',function(t) {

  var numEq = 0, numMd = 0, md

  var defaults = {
    inline: { beep: 'boop' },
    display: { baz: 'bop' }
  }

  testBehavior( fixtures['sample.mdtex'], defaults, function(cb) {
    numEq++

    t.assert( this.basename.match(/^y-frac1x-[a-z0-9]{10}.tex/), 'has the correct filename')
    t.equal( this.tex, 'y = \\frac{1}{x}', 'has the tex extracted')
    t.equal( this.params.foo, 'bar', 'parsed and received its params')
    t.assert( this.templated.match(/^\\documentclass/), 'got inserted into the latex template')

    if( this.params.display ) {
      t.equal(this.params.baz, 'bop', 'receives default display mode config')
    } else {
      t.equal(this.params.beep, 'boop', 'receives default display mode config')
    }

    // Complete the transformation:
    cb('equation-number-' + numEq)

  }, function() {
    numMd++

    // Markdown file:
    md = this.contents.toString()

    t.assert( md.match(/equation-number-1/), 'contains the first equation')
    t.assert( md.match(/equation-number-2/), 'contains the second equation')

  }).on('end',function() {
    t.equal(numEq, 2, 'got two equations')
    t.equal(numMd, 1, 'got one markdown file')
    t.end()
  })

})



test('passes a null file',function(t) {
  var numEq = 0, numMd = 0, md

  testBehavior( null, {}, function(cb) {
    numEq++
  }, function() {
    numMd++
  }).on('end',function() {
    t.equal(numEq, 0, 'got no *.tex')
    t.equal(numMd, 0, 'got no *.md')
    t.end()
  })
})



