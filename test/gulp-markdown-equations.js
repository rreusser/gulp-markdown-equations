'use strict'

var test = require('tape')
  , gulpMarkdownEquations = require('../lib')
  , tap = require('gulp-tap')
  , File = require('vinyl')
  , fixtures = require('./fixtures')
  , path = require('path')

//test.createStream().pipe(require('tap-spec')()).pipe(process.stdout);

function testBehavior(input, options, eqCallback, mdCallback) {

  var mdeq = gulpMarkdownEquations(options)

  mdeq.write(new File({ path: 'sample.mdtex', contents: input }))
  mdeq.end()

  mdeq.pipe(tap(function(file) {
    if( file.contents === null ) return
    if( file.basename.match(/\.md$/) ) {
      if( mdCallback ) mdCallback.bind(file)()
    } else {
      if( eqCallback ) {
        mdeq.complete(file,eqCallback)
      } else {
        mdeq.complete(file,function(cb) { cb() })
      }
    }
  }))

  return mdeq
}


test('gulp-markdown-equations: a null templator passes tex through',function(t) {
  testBehavior(fixtures['sample.mdtex'], { templator: null }, function(cb) {
    t.equal( this.foo, 'bar', 'gets preprocessed config' )
    t.equal( this.templated, 'y = \\frac{1}{x}', 'tex is not templated' )
    cb('test')
  }).on('end',t.end)
})

test('gulp-markdown-equations: tex gets escaped and added as alt tag',function(t) {
  testBehavior(fixtures['sample.mdtex'], { templator: null }, function(cb) {
    t.equal( this.alt, 'y &equals; &bsol;frac&lcub;1&rcub;&lcub;x&rcub;', 'tex shows up in alt tag' )
    cb('test')
  }).on('end',t.end)
})

test('gulp-markdown-equations: a null preprocessor skips params',function(t) {
  testBehavior(fixtures['sample.mdtex'], { preprocessor: null }, function(cb) {
    t.equal( this.foo, undefined, 'params are not parsed' )
    cb('test')
  }).on('end',t.end)
})

test('gulp-markdown-equations: number of files is correct',function(t) {
  var numEq = 0, numMd = 0
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    numEq++
    cb()
  }, function() {
    numMd++
  }).on('end',function() {
    t.equal(numEq, 2, 'got two equations')
    t.equal(numMd, 1, 'got one markdown file')
    t.end()
  })

})

test('gulp-markdown-equations: default options get passed',function(t) {

  var options = {
    defaults: {
      inline: { beep: 'boop' },
      display: { baz: 'bop' }
    }
  }

  testBehavior( fixtures['sample.mdtex'], options, function(cb) {
    if( this.display ) {
      t.equal(this.baz, 'bop', 'receives default display mode config')
    } else {
      t.equal(this.beep, 'boop', 'receives default display mode config')
    }
    cb()
  }).on('end',t.end)
})

test('gulp-markdown-equations: correct result is inserted',function(t) {
  var numEq = 0, md
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    numEq++
    cb('equation-number-' + numEq)
  },function() {
    md = this.contents.toString()
    t.assert( md.match(/equation-number-1/), 'markdown contains the result of the first equation')
    t.assert( md.match(/equation-number-2/), 'markdown contains the result of the second equation')
  }).on('end',t.end)
})

test('gulp-markdown-equations: has the correct filename',function(t) {
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    t.assert( this.equation.file.basename.match(/^y-frac1x-[a-z0-9]{10}.tex/), 'has the correct filename')
    cb()
  }).on('end',t.end)
})

test('gulp-markdown-equations: tex is extracted',function(t) {
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    t.equal( this.equation.tex, 'y = \\frac{1}{x}', 'has the tex extracted')
    cb()
  }).on('end',t.end)
})

test('gulp-markdown-equations: preprocesses and inserts params',function(t) {
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    t.equal( this.foo, 'bar', 'parsed and received its params')
    cb()
  }).on('end',t.end)
})

test('gulp-markdown-equations: latex templating',function(t) {
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    t.assert( this.equation.templated.match(/^\\documentclass/), 'got inserted into the latex template')
    cb()
  }).on('end',t.end)
})

test('gulp-markdown-equations: fails if callback executed more than once',function(t) {
  testBehavior( fixtures['sample.mdtex'], {}, function(cb) {
    cb()
    t.throws(cb, Error, 'throws error on second execution')
  }).on('end',t.end)
})


test('gulp-markdown-equations: completeSync',function(t) {
  t.plan(4)
  var eqNum = 0
  var mdeq = gulpMarkdownEquations(), md

  mdeq.write(new File({ path: 'sample.mdtex', contents: fixtures['sample.mdtex'] }))
  mdeq.end()
  mdeq.on('end',t.end)

  mdeq.pipe(tap(function(file) {
    if( file.extname !== '.md' ) {
      eqNum++
      mdeq.completeSync(file,function() {
        t.equal( this.foo, 'bar', 'this is set to the equation' )
        return 'inserted-equation-' + eqNum
      })
    } else {
      md = file.contents.toString()
      t.assert( md.match(/inserted-equation-1/m), 'Markdown contains inserted equations')
      t.assert( md.match(/inserted-equation-2/m), 'Markdown contains inserted equations')
    }
  }))
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

test('gulp-markdown-equations: usepackages',function(t) {
  testBehavior( fixtures['sample.mdtex'], {
      usepackages: ['package1', 'package2']
    }, function(cb) {
    t.assert( this.equation.templated.match( /usepackage\{\s*package1\s*\}/), 'contains \\usepackage{package1}' )
    t.assert( this.equation.templated.match( /usepackage\{\s*package2\s*\}/), 'contains \\usepackage{package2}' )
    cb()
  }).on('end',t.end)
})


