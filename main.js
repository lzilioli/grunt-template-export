var path = require( 'path' );
global.req = function( module ) {
	return require( path.join( process.cwd(), 'my_modules', module ) );
};

var exporter = global.req( 'exporter' );

var toRmnPhp = exporter( {
	translator: global.req( 'dslTranslator' )( 'rmnTranslator' ),
	sourceDir: 'RMN',
	source: [ '**/*.tmpl' ],
	dest: 'build/rmn/'
} );

toRmnPhp.exportify();

var toMustache = exporter( {
	translator: global.req( 'dslTranslator' )( 'mustacheTranslator' ),
	sourceDir: 'RMN',
	source: [ '**/*.tmpl' ],
	dest: 'build/mustache/'
} );

toMustache.exportify();

var toCompiledHandlebars = exporter( {
	translator: global.req( 'handlebarsCompileTranslator' ),
	sourceDir: 'build/mustache',
	source: [ '**/*.tmpl' ],
	dest: 'build/hbsCompiled/'
} );

toCompiledHandlebars.exportify();

var toCompiledMustache = exporter( {
	translator: global.req( 'mustacheCompileTranslator' ),
	sourceDir: 'build/mustache',
	source: [ '**/*.tmpl' ],
	dest: 'build/mustacheCompiled'
} );

toCompiledMustache.exportify();
