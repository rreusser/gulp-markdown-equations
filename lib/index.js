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
  , parameterize = require('parameterize')
  , entities = require('entities')
  , md5 = require('md5')

module.exports = transformLatexToVinyl

function transformLatexToVinyl( opts ) {

  opts = opts || {}
  opts.defaults = opts.defaults || {}
  opts.defaults.inline = opts.defaults.inline || {}
  opts.defaults.display = opts.defaults.display || {}

  var wrapperFunction = opts.templator || templator

  function store(stream,tex,params,cb) {
    var name
    var parsed = extractParameters(tex)
    parsed.params = extend(params,parsed.params)
    parsed.params.tex = parsed.content.trim()
    parsed.params.alt = entities.encodeHTML( parsed.params.tex )
    var wrapped = wrapperFunction(parsed.content, parsed.params)

    if( parsed.params.name !== undefined ) {
      name = parsed.params.name
    } else {
      name = (parameterize(parsed.params.tex).slice(0,50) + '-' + md5(JSON.stringify(parsed.params)+parsed.params.tex).slice(0,10) + '.tex')
    }

    var f = new File({
      cwd: "./",
      base: "./",
      path: './' + name,
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
