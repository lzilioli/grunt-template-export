node-template-expander
======================

Piece together files from a template directory.

## Note

This is still very much a work in progress. It's not documented well, and I haven't decided on APIs and overall functionality. There's not much to see here at this point.

## Usage

```bash
npm install --save-dev git+http://git@github.com/lzilioli/node-template-exporter.git
```

```javascript
var handlebars = require( handlebars );
var exporter = require( 'exporter' )( handlebars )( {
	sourceDir: 'templates',
	source: [ '**/*.tmpl' ],
	dest: 'www',
	view: {
		getView: function(modelOpts, model) {
			// presumably the view would fetch data here based on modelOpts,
			// combine it with model, and return the result for the templates
			return model;
		}
	},
	translator: (function(handlebars){
		translate: function( templateContents, translateOpts, model ) {
			// inspect translate options here
			handlebars.registerPartial('staticTitle', translateOpts.staticTitle || '');
			var template = handlebars.compile( templateContents );
			return template( model );
		}
	} ( handlebars ) )
} );
exporter.exportify( {
	source: 'index.tmpl',
	dest: 'index.html',
	translateOpts: {
		staticTitle: 'Portfolio'
	},
	modelOpts: {
		featuredTag: 'portfolio'
	},
	model: {
		bodyClass: 'home'
	}
} );
```

### Example

If you ran the code below with the following file present,

#### templates/index.tmpl
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset=utf-8 />
	<title>{{staticTitle}}</title>
</head>
<body class="{{ bodyClass }}">

</body>
</html>
```

you'd get the following output:

#### www/index.html
```html
<!DOCTYPE html>
<html>
<head>
	<meta charset=utf-8 />
	<title>Portfolio</title>
</head>
<body class="home">

</body>
</html>
```

(note that this example ignores the featuredTag value, however this could be used by `view.getView()` to only return blog items that match the given tag).

### Options

// TODO: Document all optional options

#### options.sourceDir

// TODO: make `sourceDir` optional
Directly in which to apply the globbing patterns passed in options.source.

#### options.source

Globbing pattern to select files within sourceDir to consider in the export operation.

#### options.dest (optional)

// TODO: This may not work if dest is omitted and no options are passed to `exportify()`

Directory in which to put all of the exported files. If omitted, the files will be placed relative to the current directory.

#### options.translator

Must expose a translate function that accepts 3 arguments:

- templateContents
-- the contents of the template being translated
- translateOpts
-- passed from the call to `exportify()`. These can be inspected to register on-the-fly behavior for that particular translation.
- model
-- The model as returned by `options.view.getView()`

#### options.view

Object that exposes a `getView()` function that accepts 2 arguments:

- modelOpts
-- Passed from exportify options.modelOpts. Use these to tell your view how to render for the given export action.
- model
-- Passed from exportify options.model. Its likely you'll want to pass some stuff from the exportify call directly into the model. Use this object for that. It is the responsibility of getView to return a model containing these values, if your templates expect them to be there.

### Exportify Options

The argument to exportify is optional. If omitted, every file in `options.sourceDir` whose name matches the globbing pattern passed in `options.source` will be run through the translator.

#### exportify.options.source

Template to build out into options.dest.

#### exportify.options.dest

The file in which write the exported contents. Will be relative to the above `options.dest`, if specified.

#### exportify.options.translateOpts

Gets passed to `translator.translate()`

#### exportify.options.modelOpts

Gets passed to `view.getView()`.

#### exportify.options.model

Gets passed to `view.getView()`.
