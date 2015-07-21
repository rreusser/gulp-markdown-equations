'use strict'

var leadingParameterRegex = /^\[([^=]+)(?:=([^\]]+[^\\]))?\](.*)|^\[\](.*)/

module.exports = function(str) {

  var match, params = {}, i=0

  while(match=str.match(leadingParameterRegex)) {
    if( match[3] === undefined ) {
      str = match[4]
    } else {
      if( match[1] !== undefined ) {
        if( match[2] === undefined ) {
          params[match[1]] = true
        } else {
          params[match[1]] = match[2].replace(/\\\[/,'[').replace(/\\\]/,']')
        }
      }
      str = match[3]
    }
    if( i++ > 100 ) throw new Error("markdown-mathmode-to-vinyl#extract-parameters: Looks like an infinite loop")
  }

  return {params: params, str: str}
}
