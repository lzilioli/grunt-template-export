var path = require( 'path' );
var fs = require( 'fs' );
var _ = require( 'underscore' );
var mkpath = require( 'mkpath' );
var util = require( 'lz-node-utils' );

module.exports = function( handlebars ) {
	return function( config ) {

		config = _.defaults( config, {
			// directory from which to source the templtes
			// sourceDir:
			// (array) globbing pattern of files in sourceDir
			// source:
			// (string) directory in which to place translated files
			// dest:
			// translator object, must expost function translate(templateContents, model)
			translator: {
				translate: function( templateContents ) {
					return templateContents;
				}
			},
			partialPathToName: function( partialPath ) {
				return partialPath.replace( '.tmpl', '' );
			}
		} );

		// TODO: ensure that config.sourceDir exists

		var sourceFiles = listSourceFiles( config.source );

		// Get a list of sourceFiles that are considered partials
		var partialTemplates = _.filter( sourceFiles, isPartial );

		// Register each partial with handlebars
		_.each( partialTemplates, function( filePath ) {
			var partialName = getPartialName( filePath );
			var partialContents = util.file.read( filePath );
			handlebars.registerPartial( partialName, partialContents );
		} );

		/***************************************************************************
		 ****************************    EXTERNAL API    ***************************
		 **************************************************************************/
		return {
			exportify: function( options ) {
				if ( !options ) {
					options = {};
				}

				var toExport;

				// TODO: Clean up API
				var defaults = {
					source: '',
					dest: '',
					model: {},
					modelOpts: {},
					translateOpts: {}
				};

				if ( options.targets ) {
					toExport = _.map( options.targets, function( pageOpts ) {
						return _.defaults( {
							source: realPath( pageOpts.source ),
							dest: path.join( config.dest, pageOpts.dest ),
							model: getModel( pageOpts ),
							translateOpts: pageOpts.translateOpts
						}, defaults );
					} );
				} else if ( options ) {
					toExport = [ _.defaults( {
						source: realPath( options.source ),
						dest: path.join( config.dest, options.dest ),
						model: getModel( options ),
						translateOpts: options.translateOpts
					}, defaults ) ];
				} else {
					toExport = _.map( sourceFiles, function( sourcePath ) {
						var pathFromSrc = getPathFromSourceDir( sourcePath );
						var dest = path.join( config.dest, pathFromSrc );
						return _.defaults( {
							source: sourcePath,
							dest: dest,
							model: {}
						}, defaults );
					} );
				}

				_.each( toExport, function( paths ) {

					// Create the destination dir if it doesn't exist
					mkpath.sync( path.dirname( paths.dest ) );

					// Pass the file through the translator
					var translated = '';
					try {
						translated = config.translator.translate( util.file.read( paths.source ), paths.translateOpts, paths.model );
					} catch ( exception ) {
						console.log( 'Error translating file: ' + paths.source );
						console.log( exception.message );
						process.exit( 1 );
					}

					// Write the translated file to its destination
					fs.writeFileSync( path.join( process.cwd(), paths.dest ), translated );
				} );
			}
		};

		/***************************************************************************
		 ********************************    HELPERS    ****************************
		 **************************************************************************/
		function listSourceFiles( from ) {
			// For each item in config.source, prepend config.sourceDir
			// so that the pattern refers to an existing path.
			var retVal = _.map( from, realPath );
			// Pass the resulting array to util.file.expand to get a list of files
			retVal = util.file.expand( retVal );
			return retVal;
		}

		function getModel( pageOpts ) {
			if ( config.view ) {
				return config.view.getView( pageOpts.modelOpts, pageOpts.model );
			} else if ( pageOpts.model ) {
				return pageOpts.model;
			} else {
				return {};
			}
		}

		function realPath( to ) {
			return path.join( config.sourceDir, to );
		}

		function getPathFromSourceDir( to ) {
			var sourceDir = config.sourceDir;
			if ( sourceDir[ sourceDir.length - 1 ] !== '/' ) {
				sourceDir = sourceDir + '/';
			}
			return to.substr( sourceDir.length );
		}

		// Something is considered a partial if the filename begins with `_`
		function isPartial( filePath ) {
			return path.basename( filePath )[ 0 ] === '_';
		}

		// The relative path of the partial from sourceDir, without the .tmpl extension
		function getPartialName( filePath ) {
			return config.partialPathToName( getPathFromSourceDir( filePath ) );
		}
	};
};
