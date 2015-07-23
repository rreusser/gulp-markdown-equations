'use strict'

var extend = require('util-extend')
  , computeFilename = require('./compute-filename')
  , entities = require('entities')
  , gutil = require('gulp-util')
  , File = require('vinyl')
  , assert = require('assert')

module.exports = Equation

function Equation( input, params, callback, config ) {

  if( config.preprocessor === null ) {

    // Skip the preprocessor:
    this.tex = input
    this.params = params

  } else {
    var preprocessed = config.preprocessor(input)

    // Set the LaTeX content:
    this.tex = preprocessed.content

    // Extend the input params by params from the preprocessor:
    this.params = extend(params, preprocessed.params)
  }

  this.params.usepackages = (this.params.usepackages || []).concat( config.usepackages || [] )

  // Set an alt tag unless provided:
  this.alt = this.params.alt || entities.encodeHTML( this.tex.trim() )

  // Stick the raw eq inside a latex template:
  this.templated = config.templator === null ? this.tex : config.templator(this.tex, this.params)

  // Compute the filename if not already provided as this.params.name
  var filename = computeFilename( this.tex, this.params )

  // Create a vinyl file. Extension (*.tex) comes from this.filename
  this.file = new File({
    cwd: "./",
    base: "./",
    path: './' + filename,
    contents: new Buffer(this.templated)
  })

  this.callback = function() {
    this.callback = function(){
      throw new gutil.PluginError('gulp-markdown-equations', 'Equation transform callback executed more than once')
    }
    return callback.apply(this,arguments)
  }.bind(this)
}
