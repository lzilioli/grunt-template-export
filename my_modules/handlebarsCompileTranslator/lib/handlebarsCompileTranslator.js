var handlebars = require( 'handlebars' );

module.exports = ( function() {

	function translate( templateContents ) {
		var template = handlebars.precompile( templateContents );
		return template;
	}

	return {
		translate: translate
	};
}() );
