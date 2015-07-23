# gulp-markdown-equations
[![Build Status](https://travis-ci.org/rreusser/gulp-markdown-equations.svg)](https://travis-ci.org/rreusser/gulp-markdown-equations) [![npm version](https://badge.fury.io/js/gulp-markdown-equations.svg)](http://badge.fury.io/js/gulp-markdown-equations) [![Dependency Status](https://david-dm.org/rreusser/gulp-markdown-equations.svg)](https://david-dm.org/rreusser/gulp-markdown-equations)

A gulp plugin that makes it easy to replace markdown latex equations with rendered images


## Introduction

This module exposes the tools necessary to to substitute <img alt="undefined" valign="middle" src="docs/images/latex-d3a0aa2938.png" width="52" height="19"> equations in a markdown document with rendered raster or vector images. It uses the [transform-markdown-mathmode](https://www.npmjs.com/package/transform-markdown-mathmode) node module to locate and transform equations and reconnects with the gulp pipeline after the results have been rendered to complete the transformation using information from the result.

This means you can just mix <img alt="undefined" valign="middle" src="docs/images/latex-d3a0aa2938.png" width="52" height="19"> into your markdown document. For example,

```markdown
It handles inline equations like $\nabla \cdot \vec{u} = 0$ and display equations like $$\frac{D\rho}{Dt} = 0.$$
```

gets transformed into:

It handles inline equations like <img alt="undefined" valign="middle" src="docs/images/nabla-cdot-vecu-0-6eeb39bd86.png" width="74" height="15.5"> and display equations like <p align="center"><img alt="undefined" valign="middle" src="docs/images/fracdrhodt-0-8bb9cfaad7.png" width="73.5" height="57"></p>

Of course it's gulp plugin though, so that means you can really do whatever you want with it!

## Example

The following is a gulp task that locates equations in markdown, renders them, and lets you do whatever you want with the result! First things first, here's the data flow:

<p align="center"><img src="docs/images/flowchart.png" width="408" height="460"></p>

```javascript
var gulp = require('gulp')
  , mdEq = require('gulp-markdown-equations')
  , tap = require('gulp-tap')
  , filter = require('gulp-filter')
  , latex = require('gulp-latex')
  , pdftocairo = require('gulp-pdftocairo')


gulp.task('mdtex',function() {

  var texFilter = filter('*.tex')
  var mdFilter = filter('*.md')

  // Instantiate the transform and set some defaults:
  var eqSub = mdEq({
    defaults: {
      display: { margin: '1pt' },
      inline: {margin: '1pt'}
    }
  })

  return gulp.src('*.mdtex')

    // Locate equations in the markdown stream, preprocess them, insert them
    // into a latex template, and pass them as separate *.tex file objects:
    .pipe(eqSub)

    // Filter to operate on *.tex documents:
    .pipe(texFilter)

    // Render the equations to pdf:
    .pipe(latex())

    // Convert the pdf equations to png:
    .pipe(pdftocairo({format: 'png'}))

    // Send them to the images folder:
    .pipe(gulp.dest('images'))

    // Match the output images up with the closures that are still waiting
    // on their callbacks from the `.pipe(eqSub)` step above. That means
    // we can use metadata from the image output all the way back  up in
    // the original transform. Sweet!
    //
    .pipe(tap(function(file) {
      eqSub.complete(file,function(cb,meta) {
        var img = '<img alt="'+meta.alt+'" valign="middle" src="'+meta.path+'" width="'+meta.width/2+'" height="'+meta.height/2+'">'
        meta.display ? cb('<p align="center">'+img+'</p>') : cb(img)
      })
    }))

    // Restore and then change filters to operate on the *.md document:
    .pipe(texFilter.restore()).pipe(mdFilter)

    // Output in the current directory:
    .pipe(gulp.dest('./'))
})
```

The task is the run with:

```bash
$ gulp mdtex
```


## API


## Internals

Unless you want to submit a PR to fix some corner cases or improve the behavior, you probably won't have to muck around with this stuff. The only internals here are really just a preprocessor that lets you configure parameters for each equation and a templator that actually inserts the equation into a <img alt="undefined" valign="middle" src="docs/images/latex-d3a0aa2938.png" width="52" height="19"> template.

### Preprocessor

The preprocessor is just a function that operates on the content of an equation before it's inserted in the LaTeX template. This is just a quick and dirty way to set equation-specific configuration. Its job is to extract parameters and return them as key/value pairs. A preprocessor must return `params` and `content`, e.g.:

```javascript
{
  params: {key1: "value1", key2: "value2"},
  content: "<latex equation>"
}
```

The default preprocessor is `require('gulp-markdown-equations/preprocessor/default')`. Sample usage:

```javascript
var pre = require('gulp-markdown-equations/preprocessor/default')`

pre("[name=parabola][margin=10pt]y=x^2")

// Returns:
// { params: { name: "parabola", margin: "10pt" }, content: "y=x^2" }
```

**NB**: For the default preprocessor, any leading spaces in the string will prevent parameters from working. This is by design so that it doesn't interfer with anything <img alt="undefined" valign="middle" src="docs/images/tex-1a55453e69.png" width="38" height="19">. So `$[margin=10pt 0pt] y=x$` will render <img alt="undefined" valign="middle" src="docs/images/yx-6e74074eea.png" width="83" height="12"> with a 10pt margin on the sides, while `$ [margin=10pt 0pt] y=x$` will render: <img alt="undefined" valign="middle" src="docs/images/margin10pt-0pt-yx-d5d87e8e7f.png" width="203.5" height="21">.

### Templator

The templator's job is to insert <img alt="undefined" valign="middle" src="docs/images/latex-d3a0aa2938.png" width="52" height="19"> into a template. It receives configuration variables with the following precedence:

1. parameters extracted by the preprocessor
2. display/inline config passed to the transform
3. default disply/inline config

By default, the delimiter (`$$` vs `$`) results in either `{display:true, inline: false}` or `{display:false, inline:true}`, respectively. The default templator is `require('gulp-markdown-equations/templator/default')`, but in general it's a function of format:

```javscript
function templator( content, parameters ) {
  // your logic
  return "\\documentclass... <latex>"
}
```



## Installation

To install, run

```bash
$ npm install gulp-markdown-equations
```


## Testing

Tests on the way too...

## Credits

(c) 2015 Ricky Reusser. MIT License