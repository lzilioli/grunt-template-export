module.exports = function( helperFns ) {

	var handlebars = require( 'handlebars' );
	var _ = require( 'underscore' );
	var path = require( 'path' );
	var fs = require( 'fs' );

	helperFns = helperFns || {};
	helperFns = _.defaults( helperFns, {
		getPartialName: function( partialPath ) {
			// The relative path of the partial from sourceDir, without the .tmpl extension
			return partialPath.replace( '.tmpl', '' );
		},
		// Something is considered a partial if the filename begins with `_`
		isPartial: function( filePath ) {
			return path.basename( filePath )[ 0 ] === '_';
		}
	} );

	return {
		init: function( templates ) {
			// Get a list of sourceFiles that are considered partials
			var partialTemplates = _.filter( templates, helperFns.isPartial );

			// Register each partial with handlebars
			_.each( partialTemplates, function( filePath ) {
				var partialName = helperFns.getPartialName( filePath );
				var partialContents = readFile( filePath );
				handlebars.registerPartial( partialName, partialContents );
			} );
		},
		translate: function( templateContents, model ) {
			var template = handlebars.compile( templateContents );
			return template( model );
		}
	};

	function readFile( toRead ) {
		if ( !fs.existsSync( toRead ) ) {
			throw new Error( 'file does not exist: ' + toRead );
		} else {
			return fs.readFileSync( toRead ).toString();
		}
	}
};
