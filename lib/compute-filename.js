'use strict'

var parameterize = require('parameterize')
  , md5 = require('md5')

module.exports = computeFilename

function computeFilename( content, params ) {

  var basename = params.name || parameterize(content).slice(0,45)
  var hash = md5(JSON.stringify(params)+content).slice(0,10)

  return ( basename + '-' + hash + '.tex')

}
