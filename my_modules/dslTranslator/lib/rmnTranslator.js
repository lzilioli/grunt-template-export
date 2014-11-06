var path = require( 'path' );

module.exports = function() {

	function phpWrap( text, echo ) {
		var ret = '<?';
		if ( echo ) {
			ret += '=';
		}
		ret += ' ';
		return ret + text + ' ?>';
	}

	function callFunc( className, funcName ) {
		var ret = className + '::' + funcName + '(';
		var curArgIdx = 2;
		var curArg = arguments[ curArgIdx ];
		while ( curArg && typeof curArg === 'string' ) {
			var hasNextArg = typeof arguments[ curArgIdx + 1 ] === 'string';
			ret += '"' + curArg + '"' + ( hasNextArg ? ', ' : '' );
			curArgIdx++;
			curArg = arguments[ curArgIdx ];
		}
		ret += ')';
		return ret;
	}

	var helpers = {
		sitePath: function( thePath ) {
			return 'http://' + path.join( thePath );
		},
		pv: function( value, fallbackValue ) {
			// return '{{ ' + value + ' }}';
			return phpWrap( callFunc( 'page', 'value', value, fallbackValue ), true );
		},
		pc: function( value ) {
			return phpWrap( callFunc( 'page', 'content', value ) );
		},
		ifequals: function( value, expectedValue, fallbackValue ) {
			// return '{{ ' + value + ' }}';
			return phpWrap( 'if(' + callFunc( 'page', 'value', value, fallbackValue ) + ' == "' + expectedValue + '") {' );
		},
		endifequals: function() {
			// return '{{ ' + value + ' }}';
			return phpWrap( '}' );
		},
		ctx: function( value ) {
			return phpWrap( callFunc( 'page', 'changeContext', value ) );
		},
		endctx: function() {
			return phpWrap( callFunc( 'page', 'popContext' ) );
		},
		list: function() {
			return '';
		},
		endlist: function() {
			return '';
		},
		lacks: function( value ) {
			return phpWrap( 'if(!' + callFunc( 'page', 'has', value ) + ') {' );
		},
		endLacks: function() {
			return phpWrap( '}' );
		},
		has: function( value ) {
			return phpWrap( 'if(' + callFunc( 'page', 'has', value ) + ') {' );
		},
		endHas: function() {
			return phpWrap( '}' );
		}
	};

	return helpers;

};
