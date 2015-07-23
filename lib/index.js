'use strict'

var through = require('through2')
  , tmm = require('transform-markdown-mathmode')
  , gutil = require('gulp-util')
  , rawBody = require('raw-body')
  , extend = require('util-extend')
  , path = require('path')

  , defaultTemplator = require('equation-to-latex')
  , defaultPreprocessor = require('square-parameters')
  , Equation = require('./equation')
  , EquationLookup = require('./equation-list')

module.exports = gulpMarkdownEquations

function gulpMarkdownEquations( opts ) {


  // Generate the expected defaults if not provided:
  var config = opts || {}
  config.defaults = config.defaults || {}
  config.defaults.inline = config.defaults.inline || {}
  config.defaults.display = config.defaults.display || {}

  // Set default config:
  if( config.templator === undefined ) config.templator = defaultTemplator
  if( config.preprocessor === undefined ) config.preprocessor = defaultPreprocessor

  // Create a lookup table so we can match up files with their equations:
  var equations = new EquationLookup()


  // Return a through transform:
  var transform = through.obj(function(file,enc,cb) {

    // Pass null files through:
    if( file.isNull() ) {
      cb(null,file)
      return
    }

    // No reason we couldn't support streams, really, except LaTeX is pretty
    // fundamentally stream-unfriendly
    if( file.isStream() ) {
      throw new gutil.PluginError('gulp-markdown-equations','Streams not supported!')
    }


    // Locate equations and store the callback in a new equation for later use,
    // then push the vinyl file object for this equation down the file stream:
    var parser = tmm({

      display: function(tex,cb) {
        var params = extend({display:true,inline:false},config.defaults.display)
        this.push( equations.store(new Equation( tex, params, cb, config )).file )
      }.bind(this),


      inline: function(tex,cb) {
        var params = extend({display:false,inline:true},config.defaults.inline)
        this.push( equations.store(new Equation( tex, params, cb, config )).file )
      }.bind(this)

    })


    // Wait for the parser to complete, then rewrite the original file from
    // *.mdtex to *.md and push it down the file stream
    rawBody(parser,function(err,data) {
      file.contents = data
      file.path = gutil.replaceExtension( file.path, '.md' )
      this.push(file)
      gutil.log("Pushed '" + gutil.colors.cyan(path.relative( file.base, file.path))  + "' to file stream")
      cb()
    }.bind(this))


    // Oh yeah, actually need to send the file to the parser stream:
    file.pipe(parser)
  })


  // Alias this function so that we can call it from the transform object itself:
  transform.complete = equations.complete.bind(equations)
  transform.completeSync = equations.completeSync.bind(equations)


  return transform
}
