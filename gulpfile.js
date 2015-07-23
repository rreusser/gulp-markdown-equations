'use strict'

var gulp = require('gulp')
  , eqSub = require('./lib')
  , tap = require('gulp-tap')
  , filter = require('gulp-filter')
  , latex = require('gulp-latex')
  , pdftocairo = require('gulp-pdftocairo')


gulp.task('mdtex',function() {

  var texFilter = filter('*.tex')
  var mdFilter = filter('*.md')
  var sub = eqSub({
    defaults: {
      display: { margin: '1pt 5pt' },
      inline: {margin: '0 1pt 0pt 0pt'}
    }
  })

  return gulp.src('*.mdtex')
    .pipe(sub)

    .pipe(texFilter)
    .pipe(latex())
    .pipe(pdftocairo({format: 'png', resolution:270}))
    .pipe(gulp.dest('docs/images'))
    .pipe(tap(function(file) {
      sub.complete(file,function(cb) {
        var img = '<img alt="'+this.alt+'" valign="middle" src="'+this.path+'" width="'+this.width/2+'" height="'+this.height/2+'">'
        this.display ? cb('<p align="center">'+img+'</p>') : cb(img)
      })
    }))
    .pipe(texFilter.restore())

    .pipe(mdFilter)
    .pipe(gulp.dest('./'))
    .pipe(mdFilter.restore())

})

