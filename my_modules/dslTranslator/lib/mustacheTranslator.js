var path = require( 'path' );

module.exports = function( handlebars ) {

	var stacks = {
		ifStack: [],
		sections: []
	};

	var helpers = {
		sitePath: function( thePath ) {
			return 'http://' + path.join( thePath );
		},
		pv: function( value ) {
			return '{{ ' + value + ' }}';
		},
		pc: function( templateName ) {
			var template = handlebars.compile( handlebars.partials[ templateName ] );
			var renderedContent = template();
			return renderedContent;
		},
		ifequals: function( value ) {
			stacks.ifStack.push( value );
			return '{{# ' + value + ' }}';
		},
		endifequals: function() {
			return '{{/ ' + stacks.ifStack.pop() + ' }}';
		},
		ctx: function( value ) {
			stacks.sections.push( value );
			return '{{# ' + value + ' }}';
		},
		endctx: function() {
			return '{{/ ' + stacks.sections.pop() + ' }}';
		},
		list: function( value ) {
			stacks.sections.push( value );
			return '{{# ' + value + ' }}';
		},
		endlist: function() {
			return '{{/ ' + stacks.sections.pop() + ' }}';
		},
		lacks: function( value ) {
			stacks.ifStack.push( value );
			return '{{^ ' + value + ' }}';
		},
		endLacks: function() {
			return '{{/ ' + stacks.ifStack.pop() + ' }}';
		},
		has: function( value ) {
			stacks.ifStack.push( value );
			return '{{# ' + value + ' }}';
		},
		endHas: function() {
			return '{{/ ' + stacks.ifStack.pop() + ' }}';
		}
	};

	return helpers;
};
