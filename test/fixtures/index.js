'use strict'

var glob = require('glob')
  , path = require('path')
  , fs = require('fs')

var files = glob.sync(__dirname + "/**/*")
var fixtures = {}

files.forEach(function(f) {
  if( f === __filename ) return
  var rel = path.relative( __dirname, f )

  fixtures[rel] = fs.readFileSync(f)
})

module.exports = fixtures



