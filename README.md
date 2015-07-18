# markdown-mathmode-to-vinyl

[![Build Status](https://travis-ci.org/rreusser/markdown-mathmode-to-vinyl.svg)](https://travis-ci.org/rreusser/markdown-mathmode-to-vinyl) [![npm version](https://badge.fury.io/js/markdown-mathmode-to-vinyl.svg)](http://badge.fury.io/js/markdown-mathmode-to-vinyl) [![Dependency Status](https://david-dm.org/rreusser/markdown-mathmode-to-vinyl.svg)](https://david-dm.org/rreusser/markdown-mathmode-to-vinyl)

Separate a stream of markdown with embedded LaTeX equations into a stream of separate markdown and LaTeX vinyl files


## Introduction

WIP. This uses the [transform-markdown-mathmode](https://www.npmjs.com/package/transform-markdown-mathmode) node module to extract equations from a markdown document. The markdown goes in one end of the stream as a file object. The equations get transformed by some function, the original file gets pushed out the stream as a file, and each equation gets pushed as a separate file. The tex files presumably get wrapped in a document, rendered, and converted as the next steps in the pipeline. This is obviously pretty amenable to a gulp plugin, but whether this will *be* a gulp plugin or whether it will get wrapped in a gulp plugin remains to be seen.


## Example

Configuration options aren't there yet. I'm just posting this to back things up while in development and to illustrate the general plan.

```
var transformer = require('markdown-mathmode-to-vinyl')
  , File = require('vinyl')

var markdownFile, extractor

markdownFile = new File({
  path: "./test/sample.mdtex",
  contents: new Buffer("A parabola has the equation $y = x^2$, while\n"+
                       "a hyperbola has the equation $y = 1/x$")
});

extractor = transformer()
extractor.write(markdownFile)
extractor.end()
extractor.on('data',...)
```

The object stream output is three files:

```javascript
<File "test/sample.md" <Buffer 41 20 70 61 72 61 62 6f 6c ... >>
<File "equation1.tex" <Buffer 79 20 3d 20 78 5e 32>>
<File "equation2.tex" <Buffer 79 20 3d 20 31 2f 78>>
```

Naming and configuration is in progress.




## Credits

(c) 2015 Ricky Reusser. MIT License
