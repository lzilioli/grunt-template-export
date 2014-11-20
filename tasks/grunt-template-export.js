var _ = require( 'underscore' );
var path = require( 'path' );

module.exports = function( grunt ) {

	grunt.registerMultiTask( 'template-export', function() {

		var taskTarget = this.target;
		var opts = this.options();

		// Defaults (TODO: I couldn't figure out how to get grunt to do a deep
		// extend with defaults passed to this.options(), so for now, ugly code.)
		var modelNoop = require( '../lib/model-noop' );
		opts.model = opts.model || modelNoop;
		opts.model.init = opts.model.init || modelNoop.init;
		opts.model.getModel = opts.model.getModel || modelNoop.getModel;
		var theModel = opts.model;
		delete opts.model;

		var translatorNoop = require( '../lib/translator-noop' );
		opts.translator = opts.translator || translatorNoop;
		opts.translator.init = opts.translator.init || translatorNoop.init;
		opts.translator.translate = opts.translator.translate || translatorNoop.translate;
		var theTranslator = opts.translator;
		delete opts.translator;

		// allow each value in options.sourceFiles to be specified in any of the
		// ways that files can be passed to grunt tasks
		// will always result in keyInSourceFiles: [flat,list,of,files]
		var sourceFiles = _.chain( opts.sourceFiles )
			.map( function( fileArgs, name ) {
				var ret = {};
				ret[ name ] = _.chain( grunt.task.normalizeMultiTaskFiles( fileArgs ) )
					.pluck( 'src' )
					.flatten()
					.value();
				return ret;
			} )
			.reduce( function( memo, initialValue ) {
				var key = _.keys( initialValue )[ 0 ];
				memo[ key ] = initialValue[ key ];
				return memo;
			}, {} )
			.value();

		delete opts.sourceFiles;

		theTranslator.init( sourceFiles, opts );
		theModel.init( sourceFiles, opts );

		this.files.forEach( function( file ) {
			if ( file.src && file.src.length > 1 ) {
				grunt.fail.fatal( [
					'render-templates task does not know how to map multiple',
					'src files to a single dest file.'
				].join( ' ' ) );
			}

			var templatePath;
			var templateContents;

			if ( file.src ) {
				templateContents = file.src.filter( function( filepath ) {
					// Remove nonexistent files (it's up to you to filter or warn here).
					if ( !grunt.file.exists( filepath ) ) {
						grunt.log.fail( 'Source file "' + filepath + '" not found.' );
						return false;
					} else {
						return true;
					}
				} ).map( function( filepath ) {
					templatePath = filepath;
					return grunt.file.read( filepath );
				} )[ 0 ];
			}
			try {
				var model = theModel.getModel( opts, templatePath, templateContents );
				var translatedContents = theTranslator.translate( templateContents, model, opts, templatePath );
				grunt.file.mkdir( path.dirname( file.dest ) );
				grunt.file.write( file.dest, translatedContents );
				grunt.log.writeln( 'File "' + file.dest + '" created.' );
			} catch ( exception ) {
				throw new Error( [
					'Unhandeled exception during translation of:',
					taskTarget,
					'using template:',
					templatePath,
					'with contents:',
					templateContents,
					'error:',
					exception.message
				].join( ' ' ) );
			}
		} );
	} );
};
