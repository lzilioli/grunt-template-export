var shell = require( 'shelljs' );
require( 'colors' );

module.exports = function( grunt ) {
	grunt.registerTask( 'hooks', function() {
		shell.cp( 'grunt/hooks/*', '.git/hooks/' );
	} );
};
