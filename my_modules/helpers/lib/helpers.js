var fs = require( 'fs' );

module.exports = ( function() {

	return {
		getTemplateContents: function( forTemplate ) {
			if ( !forTemplate ) {
				return '';
			}

			if ( !fs.existsSync( forTemplate ) ) {
				console.log( 'template file does not exist:', forTemplate );
				return '';
			} else {
				var contents = fs.readFileSync( forTemplate ).toString();
				return contents;
			}
		}
	};
}() );
