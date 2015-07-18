'use strict'

var through = require('through2')
  , tmm = require('transform-markdown-mathmode')
  , File = require('vinyl')
  , Stream = require('stream')

module.exports = transformLatexToVinyl

function transformLatexToVinyl( opts ) {

  return through.obj(function(file,enc,cb) {

    var texFiles = []
    var buf = ''

    var parser = tmm({
      inline: function(tex,cb) {
        texFiles.push(new File({
          cwd: "./",
          base: "./",
          path: "./test.tex",
          contents: new Buffer(tex)
        }))
        cb('<img src="...">')
      }
    })

    parser.on('data',function(chunk,enc,cb) {
      buf += chunk.toString()
    }).on('end',function() {
      console.log('buf=',buf)
    })

    file.pipe(parser)

    file.contents = new Buffer(buf)
    file.path = file.path.replace(/mdtex$/,'md')
    this.push(file)

    texFiles.forEach(this.push.bind(this))

    cb()

  })

}
