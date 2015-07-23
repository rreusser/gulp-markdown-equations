'use strict'

var gulp = require('gulp')
  , eqSub = require('./lib')
  , tap = require('gulp-tap')
  , filter = require('gulp-filter')
  , latex = require('gulp-latex')
  , pdftocairo = require('gulp-pdftocairo')
  , path = require('path')

function giturl(rel) {
  return 'https://rawgit.com/rreusser/gulp-markdown-equations/master/' + rel
  //return 'https://cdn.rawgit.com/rreusser/gulp-markdown-equations/master/' + rel
  //return rel
}

gulp.task('mdtex',function() {

  var texFilter = filter('*.tex')
  var mdFilter = filter('*.md')
  var sub = eqSub({
    defaults: {
      display: { margin: '1pt 5pt', fontSize: '12pt' },
      inline: { margin: '0 1pt 0pt 0pt', fontSize: '12pt' }
    }
  })

  return gulp.src('*.mdtex')
    .pipe(sub)

    .pipe(texFilter)
    .pipe(latex())
    .pipe(pdftocairo({format: 'svg', resolution: 1000}))
    .pipe(gulp.dest('docs/images'))
    .pipe(tap(function(file) {
      sub.complete(file,function(cb) {
        var img = '<img alt="'+this.alt+'" valign="middle" width="' + this.width*1.8 + '" height="' + this.height*1.8 + '" src="'+giturl(this.path)+'">'
        this.display ? cb('<p align="center">'+img+'</p>') : cb(img)
      })
    }))
    .pipe(texFilter.restore())

    .pipe(mdFilter)
    .pipe(gulp.dest('./'))
    .pipe(mdFilter.restore())

})

