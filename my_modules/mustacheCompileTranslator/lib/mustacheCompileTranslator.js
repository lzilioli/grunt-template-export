module.exports = ( function() {

	var mustache = require( 'mustache' );

	function translate( templateContents ) {
		var template = mustache.parse( templateContents );
		return template;
	}

	return {
		translate: translate
	};
}() );
