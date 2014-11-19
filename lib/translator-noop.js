module.exports = ( function() {

	var _ = require( 'underscore' );

	return {
		init: _.noop,
		translate: _.identity
	};
}() );
