# markdown-mathmode-to-vinyl

# WIP

Separate a stream of markdown with embedded LaTeX equations into a stream of separate markdown and LaTeX [vinyl](https://github.com/wearefractal/vinyl) files


## Introduction

Extract equations from a markdown document using the [transform-markdown-mathmode](https://www.npmjs.com/package/transform-markdown-mathmode) node module. The markdown goes in one end of the stream as a file object. The equations get transformed by some function, the original file gets pushed out the stream as a [vinyl file](https://github.com/wearefractal/vinyl), and each equation gets pushed as a separate [vinyl file](https://github.com/wearefractal/vinyl). The tex files presumably get wrapped in a document, rendered, and converted as the next steps in the pipeline. This is obviously amenable to a gulp plugin, but whether this will *be* a gulp plugin or whether it will get wrapped in a gulp plugin remains to be seen.


## Example

```javascript
var transformer = require('markdown-mathmode-to-vinyl')
  , File = require('vinyl')

var markdownFile = new File({
  path: "./test/sample.mdtex",
  contents: new Buffer("A parabola has the equation $y = x^2$, while\n"+
                       "a hyperbola has the equation $y = 1/x$")
});

var extractor = transformer()
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

The contents are:

```javascript
text/sample.md:  "A parabola has the equation <img src="...">, while\na hyperbola has the equation <img src="...">"
equation1.tex:   "y = x^2"
equation2.tex:   "y = 1/x"
```

## TODO

- Add configuration options
- Rename?
- Complete modules for the final steps in the pipeline and wrap it up all nicelike
- Publish the module that inserts these equations into a nicely cropped LaTeX document



## Credits

(c) 2015 Ricky Reusser. MIT License
