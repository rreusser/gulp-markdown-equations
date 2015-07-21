'use strict'

var gulp = require('gulp')
  , eqSub = require('../lib')
  , tap = require('gulp-tap')
  , filter = require('gulp-filter')
  , latex = require('gulp-latex')
  , pdftocairo = require('gulp-pdftocairo')


gulp.task('mdtex',function() {

  var texFilter = filter('*.tex')
  var mdFilter = filter('*.md')
  var sub = eqSub({
    defaults: {
      display: { margin: '1pt' },
      inline: {margin: '1pt 3pt 1pt 1pt'}
    }
  })

  return gulp.src('*.mdtex')
    .pipe(sub)

    .pipe(texFilter)
    .pipe(latex())
    .pipe(pdftocairo({format: 'png', resolution:288}))
    .pipe(gulp.dest('images'))
    .pipe(tap(function(file) {
      sub.complete(file,function(cb,meta) {
        var img = '<img alt="'+meta.alt+'" valign="middle" src="'+meta.path+'" width="'+meta.width/2+'" height="'+meta.height/2+'">'
        meta.display ? cb('<p align="center">'+img+'</p>') : cb(img)
      })
    }))
    .pipe(texFilter.restore())

    .pipe(mdFilter)
    .pipe(gulp.dest('./'))
    .pipe(mdFilter.restore())

})

