var _ = require( 'underscore' );
var handlebars = require( 'handlebars' );

module.exports = function( translatorToUse ) {

	function translate( templateContents, view ) {
		var template = handlebars.compile( templateContents );
		var renderedContent = template( view );
		return renderedContent;
	}

	// Load the translator and register its helpers
	var helpers = require( './' + translatorToUse )( handlebars );

	_.each( helpers, function( value, key ) {
		handlebars.registerHelper( key, value );
	} );

	return {
		translate: translate
	};
};
