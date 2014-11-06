var path = require( 'path' );
var fs = require( 'fs' );
var _ = require( 'underscore' );
var handlebars = require( 'handlebars' );
var mkpath = require( 'mkpath' );
var util = global.req( 'util' );

module.exports = function( appConfig ) {

	// TODO: ensure that appConfig.sourceDir exists

	// Get a list of partial templates defined in the ui directory (filename begins with _)
	var templates = util.file.expand( path.normalize( path.join( appConfig.sourceDir ) + '/**/_*.tmpl' ) );

	// Register the partials
	_.each( templates, function( name ) {
		// Read in the partial
		var partial = util.file.read( name );

		// Get the name of the partial for handlebars
		// (by removing starting _ and extension)
		var partialName = name.replace( appConfig.sourceDir + '/', '' ).replace( '.tmpl', '' );

		// Register the partial with handlebars
		handlebars.registerPartial( partialName, partial );
	} );

	/***************************************************************************
	 ****************************    EXTERNAL API    ***************************
	 **************************************************************************/
	return {
		exportify: function( view ) {
			// For each item in appConfig.sources, prepend appConfig.sourceDir
			// so that the pattern refers to an existing path.
			var sourceFiles = _.map( appConfig.source, realPath );
			// Pass the resulting array to util.file.expand to get a list of files
			sourceFiles = util.file.expand( sourceFiles );

			_.each( sourceFiles, function( sourcePath ) {
				var pathFromSrc = getPathFromSourceDir( sourcePath );
				var dest = path.join( appConfig.dest, pathFromSrc );
				// Create the destination dir if it doesn't exist
				mkpath.sync( path.dirname( dest ) );
				// Pass the file through the translator
				var translated = appConfig.translator.translate( util.file.read( sourcePath ), view );
				// Write the translated file to its destination
				fs.writeFileSync( path.join( process.cwd(), dest ), translated );
			} );
		}
	};

	/***************************************************************************
	 ********************************    HELPERS    ****************************
	 **************************************************************************/
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
};
