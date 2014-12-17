grunt-template-export
=====================

Note this task is a grunt wrapper for [template-export](http://www.github.com/lzilioli/template-export).

A grunt multi-task, in MVC terms, a controller that acts as a near-transparent liason between a model and a view (referred to as a translator within this project). It enables the simple, yet highly custom exporting of templates (or other content) to a given destination.

The template-export task has four primary concerns:

1. for each source => dest pair specified in the task's options, fetch a model from a user-defined module
2. pass the contents of source, along with the model, through a user-defined translation module
3. write the result of (2) to dest
4. enforce a light-handed, yet reasonable separation between the model and the translator

The magic is in the fact that the model fetching and translation are both handeled by user-defined modules that simply need to expose a pre-determined API. As long as the modules follow this API, they can do anything they need to under-the-hood in order to generate the proper output. Specifying an implementation for either of these modules is optional.

## Usage

```bash
npm install --save lzilioli/grunt-template-export
```

## Configuring The Task

```javascript
var handlebars = require( 'handlebars' );

grunt.initConfig({
  template-export: {
    options: {
      /* NOTE: The opts argument passed to model.getModel, model.init,
       * translator.init, and translator.translate will contain all of
       * the options passed in except for the following 3
       * reserved keys (explained below):
       *  [ sourceFiles | translator | model ] */
      sourceFiles: {
        /* Arg for [lz-node-utils.file.expandSourceFiles](http://github.com/lzilioli-lz-node-utils) */
        templates: [ 'templates/**/*.tmpl' ],
        posts: [ 'blog/posts/**/*.md' ]
      },
      /* Below are the default implementations for a model and a
       * translator. If you don't provide either in the task options,
       * the default implementation will be used. Additionally,
       * if the model or translator that you provide omits one
       * of the expected functions, the task will fall back on the
       * implementations provided below for that function only. */
      model: {
        init: _.noop,
        getModel: function() { return { }; }
      },
      translator: {
        init: _.noop,
        translate: _.identity
        // _.identity is a fn that returns it's first arg
      }
    },
    /****** EXAMPLES ************************************/
    // Export the homepage, specified by templates/index.tmpl to
    // export/blog.html, registering all partials in sourceFiles.templates
    // as handlebars partials
    homepage: {
      src: [ 'src/templates/index.tmpl' ],
      dest: [ 'export/blog/index.html' ],
      options: {
        /* A default handlebars translator is provided. This
         * translator will automatically register all of the
         * templates specified in options.templates that pass
         * the isPartial test with handlebars with the name
         * returned by getPartialName.
         *
         * During translation, your template will be run through
         * handlebars with the designated partials registered.
         *
         * See the below "Extending the Default Translator" section
         * for an example on inheriting some of the default handlebars
         * translator's functionality. */
        translator: require('template-export').translators.handlebars(
          /* You must pass handlebars as your first argument
           * (see v0.0.2 commit for v0.0.2 for an explanation) */
          handlebars,
          /* The second argument is optional. It allows you to
           * specify functions to determine if a template
           * should be considered a partial (isPartial), and if so,
           * what name to register with handlebars (getPartialName)
           * If either is omitted, the default implementations
           * (shown below) will be used. */
          {
            getPartialName: function( partialPath ) {
              // The relative path of the partial from sourceDir, without the .tmpl extension
              return partialPath.replace( '.tmpl', '' );
            },
            isPartial: function( filePath ) {
              // Something is considered a partial if the filename begins with `_`
              return path.basename( filePath )[ 0 ] === '_';
            }
          }
        )
      }
    },
    // Render all of the templates in templates/**/*.tmpl out to
    // their corresponding location in build/static with the
    // .html extension, using a static model specified with JSON
    all: {
      expand: true,
      cwd: 'templates',
      src: [ '**/*.tmpl' ],
      dest: 'build/static',
      options: {
        translator: require( 'template-export' ).translators.handlebars(handlebars),
        model: {
          getModel: function(){ grunt.file.readJSON( 'model.json' ) }
        }
      }
    },
    // Move all of the files in templates/**/*.tmpl out to
    // their corresponding location in build/templates
    // (since this falls back on the default implementations for
    // the model and the translator, the templates pass-through the
    // task without being altered).
    move: {
      src: 'templates/**/*.tmpl',
      dest: 'build/templates'
    }
  }
});
```

### Options

#### `options.sourceFiles`

-- see the *Configuring the Task* section above for an explanation of this argument

#### `options.translator`

##### `options.translator.init`

    function( sourceFiles, opts )

- return
-- none
- sourceFiles
-- see the *Configuring the Task* section above for an explanation of this argument
- opts
-- all options passed to the task except ( translator, model, sourceFiles )

##### `options.translator.translate`

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

#### `options.model`

##### `options.model.init`

    function( sourceFiles, opts )

- return
-- none
- sourceFiles
-- see the *Configuring the Task* section above for an explanation of this argument
- opts
-- all options passed to the task except ( translator, model, templates )

##### `options.model.getModel`

    function( opts, templatePath, templateContents )

- return
-- Object
- opts
-- all options passed to the task except ( translator, model, templates )
- templatePath
-- the path to the source template containing templateContents
- templateContents
-- the contents of the template being translated
- theTemplates
-- list of template files as passed to `options.templates`
