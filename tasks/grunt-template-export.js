var path = require( 'path' );
var templateExport = require( 'template-export' );

module.exports = function( grunt ) {

	grunt.registerMultiTask( 'template-export', function() {

		var taskTarget = this.target;
		var exporter = templateExport.exporter( this.options() );

		this.files.forEach( function( file ) {
			if ( file.src && file.src.length > 1 ) {
				grunt.fail.fatal( [
					'render-templates task does not know how to map multiple',
					'src files to a single dest file.'
				].join( ' ' ) );
			}

			var templatePath;

			if ( file.src ) {
				file.src.filter( function( filepath ) {
					// Remove nonexistent files (it's up to you to filter or warn here).
					if ( !grunt.file.exists( filepath ) ) {
						grunt.log.fail( 'Source file "' + filepath + '" not found.' );
						return false;
					} else {
						templatePath = filepath;
						return true;
					}
				} );
			}
			try {
				var translatedContents = exporter( templatePath );
				grunt.file.mkdir( path.dirname( file.dest ) );
				grunt.file.write( file.dest, translatedContents );
				grunt.log.writeln( 'File "' + file.dest + '" created.' );
			} catch ( exception ) {
				console.log( exception.stack );
				throw new Error( [
					'Unhandeled exception during translation of:',
					taskTarget,
					'using template:',
					templatePath
				].join( ' ' ) );
			}
		} );
	} );
};
