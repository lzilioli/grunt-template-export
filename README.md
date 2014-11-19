grunt-template-export
=====================

A grunt multi-task designed to streamline the process of exporting templates out of one directory into another. Provides a way to optionally build a model dynamically for each template being exported, and pass that model, along with the template being exported through a translation step.

## Note

This is still a work in progress.

## Usage

```bash
npm install --save git+http://git@github.com/lzilioli/node-template-exporter.git
```

```JavaScript
grunt.initConfig({
	template-export: {
		options: {
			templates: {
				// The arguments passed to options.templates will be
				// interpreted the same way as you are able to
				// specify files for a grunt task.
				// Once a list of template files is determined based
				// on the templates argument, it will be passed to
				// translator.init as theTemplates argument
				src: [ 'templates/**/*.tmpl' ]
			},
			/* NOTE: The opts argument passed to model.getModel,
			 * translator.init, and translator.translate will contain
			 * all of the options passed in except the keys
			 * 	( translator, model, templates )
			 */
			model: { // default model implementation
				getModel: function( opts, templatePath, templateContents, theTemplates ) {
					return { };
				}
			},
			translator: { // default translator implementation
				init: function( theTemplates, opts )
					return;
				},
				translate: function( templateContents, model, opts, templatePath ) {
					return templateContents;
				}
			}
		},
		/* Export the homepage, as html */
		homepage: {
			src: [ 'src/templates/index.tmpl' ],
			dest: [ 'export/blog/index.html' ],
			options: {
				/* A default handlebars translator is provided. This
				 * translator will automatically register all of the
				 * templates specified in options.templates
				 * that pass the isPartial test with handlebars with the
				 * name returned by getPartialName. The default implementation
				 * of those functions is shown below, but you may override
				 * them as you wish. If you don't pass either, the defaults
				 * will be used.
				 *
				 * During translation, your template will be run through
				 * handlebars with the designated partials registered.
				 *
				 * See the below "Extending the Default Translator" section
				 * to inherit some of the default handlebars translator's
				 * functionality */
				translator: require('grunt-template-export').translators.handlebars({
					getPartialName: function( partialPath ) {
						// The relative path of the partial from sourceDir, without the .tmpl extension
						return partialPath.replace( '.tmpl', '' );
					},
					// Something is considered a partial if the filename begins with `_`
					isPartial: function( filePath ) {
						return path.basename( filePath )[ 0 ] === '_';
					}
				} )
			}
		},
		// Render all of your templates out to .html, using a static model
		all: {
			expand: true,
			cwd: 'templates',
			src: [ '**/*.tmpl' ],
			dest: 'build/tmpl',
			options: {
				translator: require( 'grunt-template-expander' ).translators.handlebars(),
				model: {
					getModel: function(){ grunt.file.readJSON( 'model.json' ) }
				}
			}
		}
	}
});
```

### Extending the Default Translator

Say you want to register a set of helper functions with handlebars to make available during the export step. You can define the following translator, and pass it in the options to template-export.

```javascript
var _ = require( 'underscore' );
var handlebars = require( 'handlebars' );

module.exports = function( translatorToUse, helperOverrides ) {

	var __parent = require( 'grunt-template-export' ).translators.handlebars.apply( this, [ helperOverrides || {} ] );

	return {
		init: function() {
			// Load the translator and register its helpers
			var helpers = {
				siteUrl: function( siteDest ) {
					return 'http://www.example.com/' + siteDest
				}
			};

			_.each( helpers, function( value, key ) {
				handlebars.registerHelper( key, value );
			} );

			__parent.init.apply( this, arguments );
		},
		translate: function() {
			return __parent.translate.apply( this, arguments );
		}
	};
};
```

### Options

#### options.templates

Object that specifies a list of files. All destinations are ignored. This is expanded in the same way that files specified for a grunt task are expanded.

#### options.translator

##### options.translator.init

	function( theTemplates, opts )

- return
-- none
- theTemplates
-- list of template files as passed to options.templates
- opts
-- all options passed to the task except ( translator, model, templates )

##### options.translator.translate

	function( templateContents, model, opts, templatePath )

- return
-- string
- templateContents
-- the contents of the template being translated
- model
-- the model as returned by `options.model.getModel()`
- opts
-- all options passed to the task except ( translator, model, templates )
- templatePath
-- the path to the source template containing templateContents

#### options.model

##### options.model.getModel

	function( opts, templatePath, templateContents, theTemplates )

- return
-- Object
- opts
-- all options passed to the task except ( translator, model, templates )
- templatePath
-- the path to the source template containing templateContents
- templateContents
-- the contents of the template being translated
- theTemplates
-- list of template files as passed to options.templates

TODO: Rename options.templates and theTemplates variable to something else. This will not necessarily contain templates, as someone could use it to generate a blog and build a model out of markdown files with yaml-front matter.
