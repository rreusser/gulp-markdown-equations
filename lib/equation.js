'use strict'

var extend = require('util-extend')
  , computeFilename = require('./compute-filename')
  , entities = require('entities')
  , gutil = require('gulp-util')
  , File = require('vinyl')

module.exports = Equation

function Equation( input, params, callback, config ) {

  // Preprocess the latex:
  var preprocessed = config.preprocessor(input)

  // Set the LaTeX content:
  this.tex = preprocessed.content

  // Extend the input params by params from the preprocessor:
  this.params = extend(params, preprocessed.params)

  // Set an alt tag unless provided:
  this.alt = this.params.alt || entities.encodeHTML( this.tex.trim() )

  // Stick the raw eq inside a latex template:
  this.templated = config.templator(this.tex, this.params)

  // Compute the filename if not already provided as this.params.name
  this.filename = computeFilename( this.tex, this.params )

  // Create a vinyl file. Extension (*.tex) comes from this.filename
  this.file = new File({
    cwd: "./",
    base: "./",
    path: './' + this.filename,
    contents: new Buffer(this.templated)
  })

  this.basename = gutil.replaceExtension(this.file, '.tex').basename

  this.callback = callback
}
