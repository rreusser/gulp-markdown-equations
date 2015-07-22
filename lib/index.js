'use strict'

var through = require('through2')
  , tmm = require('transform-markdown-mathmode')
  , File = require('vinyl')
  , Stream = require('stream')
  , extractParameters = require('../preprocessor/default')
  , gutil = require('gulp-util')
  , rawBody = require('raw-body')
  , templator = require('../templator/default')
  , path = require('path')
  , sizeOf = require('image-size')
  , extend = require('util-extend')
  , entities = require('entities')
  , computeFilename = require('./compute-filename')

module.exports = transformLatexToVinyl

function transformLatexToVinyl( opts ) {

  opts = opts || {}
  opts.defaults = opts.defaults || {}
  opts.defaults.inline = opts.defaults.inline || {}
  opts.defaults.display = opts.defaults.display || {}

  var wrapperFunction = opts.templator || templator

  function store(stream,tex,params,cb) {
    var filename
    var parsed = extractParameters(tex)
    parsed.params = extend(params,parsed.params)
    parsed.params.content = parsed.content.trim()
    parsed.params.alt = entities.encodeHTML( parsed.params.content )
    var wrapped = wrapperFunction(parsed.content, parsed.params)

    filename = computeFilename( parsed.content, parsed.params )

    var f = new File({
      cwd: "./",
      base: "./",
      path: './' + filename,
      contents: new Buffer(wrapped)
    })

    stream.equations[gutil.replaceExtension(f,'.tex').basename] = { callback: cb, params: parsed.params }
    stream.push(f)
  }

  var transform = through.obj(function(file,enc,cb) {

    if( file.isNull() ) {
      cb(null,file)
      return
    }

    if( file.isStream() ) {
      throw new gutil.PluginError('gulp-markdown-equations','Streams not supported!')
    }

    var parser = tmm({
      display: function(tex,cb) {
        store(this,tex,extend({display:true,inline:false},opts.defaults.display),cb)
      }.bind(this),

      inline: function(tex,cb) {
        store(this,tex,extend({display:false,inline:true},opts.defaults.inline),cb)
      }.bind(this)
    })

    rawBody(parser,function(err,data) {
      file.contents = data
      file.path = gutil.replaceExtension( file.path, '.md' )
      this.push(file)
      cb()
    }.bind(this))

    file.pipe(parser)
  })

  transform.equations = {}

  transform.complete = function(file,compute) {
    var meta = {}

    try {
      var dimensions = sizeOf(file.contents)
      meta.width = dimensions.width
      meta.height = dimensions.height
    } catch(e) { }

    meta.path = path.relative(file.cwd, file.path)

    var key = path.basename(gutil.replaceExtension(file.path, '.tex'))
    var eq = transform.equations[key]

    meta = extend(eq.params,meta)

    compute(function(result) {
      eq.callback(result)
    },meta)
  }

  return transform

}
