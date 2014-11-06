var path = require( 'path' );
var fs = require( 'fs' );
var _ = require( 'underscore' );
var handlebars = require( 'handlebars' );
var mkpath = require( 'mkpath' );
var file = global.req( 'file' );
var helpers = global.req( 'helpers' );

module.exports = function( appConfig ) {

	function exportify( view ) {
		// Read in the template file
		var sources = _.map( appConfig.source, function( value ) {
			return path.join( appConfig.uiPath, value );
		} );

		var templateFiles = file.expand( sources );

		_.each( templateFiles, function( templatePath ) {
			var dest = path.join( process.cwd(), appConfig.dest, templatePath );
			dest = path.normalize( dest.replace( appConfig.uiPath, '' ) );
			mkpath.sync( path.dirname( dest ) );
			var translated = appConfig.translator.translate( helpers.getTemplateContents( templatePath ), view );
			fs.writeFileSync( dest, translated );
		} );
	}

	// Get a list of partial templates defined in the ui directory (filename begins with _)
	var templates = file.expand( path.normalize( path.join( appConfig.uiPath ) + '/**/_*.tmpl' ) );

	// Register the partials
	_.each( templates, function( name ) {
		// Read in the partial
		var partial = helpers.getTemplateContents( name );

		// Get the name of the partial for handlebars
		// (by removing starting _ and extension)
		var partialName = name.replace( appConfig.uiPath + '/', '' ).replace( '.tmpl', '' );

		// Register the partial with handlebars
		handlebars.registerPartial( partialName, partial );
	} );

	return {
		exportify: exportify
	};
};
