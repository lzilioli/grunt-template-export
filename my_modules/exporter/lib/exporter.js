var path = require( 'path' );
var fs = require( 'fs' );
var _ = require( 'underscore' );
var handlebars = require( 'handlebars' );
var mkpath = require( 'mkpath' );
var util = global.req( 'util' );

module.exports = function( appConfig ) {

	// TODO: ensure that appConfig.sourceDir exists

	var sourceFiles = listSourceFiles();

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
		exportify: function( view ) {
			_.each( sourceFiles, function( sourcePath ) {
				var pathFromSrc = getPathFromSourceDir( sourcePath );
				var dest = path.join( appConfig.dest, pathFromSrc );
				// Create the destination dir if it doesn't exist
				mkpath.sync( path.dirname( dest ) );
				// Pass the file through the translator
				var translated;
				try {
					translated = appConfig.translator.translate( util.file.read( sourcePath ), view );
				} catch ( exception ) {
					console.log( 'Error translating file: ' + sourcePath );
					console.log( exception.message );
					process.exit( 1 );
				}
				// Write the translated file to its destination
				fs.writeFileSync( path.join( process.cwd(), dest ), translated );
			} );
		}
	};

	/***************************************************************************
	 ********************************    HELPERS    ****************************
	 **************************************************************************/
	function listSourceFiles() {
		// For each item in appConfig.sources, prepend appConfig.sourceDir
		// so that the pattern refers to an existing path.
		var retVal = _.map( appConfig.source, realPath );
		// Pass the resulting array to util.file.expand to get a list of files
		retVal = util.file.expand( retVal );
		return retVal;
	}

	function realPath( to ) {
		return path.join( appConfig.sourceDir, to );
	}

	function getPathFromSourceDir( to ) {
		var sourceDir = appConfig.sourceDir;
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
		return getPathFromSourceDir( filePath ).replace( '.tmpl', '' );
	}
};
