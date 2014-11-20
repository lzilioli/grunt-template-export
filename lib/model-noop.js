module.exports = ( function() {

	var _ = require( 'underscore' );

	return {
		init: _.noop,
		getModel: _.constant( {} )
	};
}() );
