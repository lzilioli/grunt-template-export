var path = require( 'path' );
global.req = function( module ) {
	return require( path.join( process.cwd(), 'my_modules', module ) );
};

var exporter = global.req( 'exporter' );

var toRmnPhp = exporter( {
	translator: global.req( 'dslTranslator' )( 'rmnTranslator' ),
	uiPath: 'RMN',
	source: [ '**/*.tmpl' ],
	dest: 'build/rmn/'
} );

toRmnPhp.exportify();

var toMustache = exporter( {
	// TODO: having to pass RMN as source root all the way down to mustacheTranslator is a shitty pattern
	translator: global.req( 'dslTranslator' )( 'mustacheTranslator', 'RMN' ),
	uiPath: 'RMN',
	source: [ '**/*.tmpl' ],
	dest: 'build/mustache/'
} );

toMustache.exportify();

var toCompiledHandlebars = exporter( {
	translator: global.req( 'handlebarsCompileTranslator' ),
	uiPath: 'build/mustache',
	source: [ '**/*.tmpl' ],
	dest: 'build/hbsCompiled/'
} );

toCompiledHandlebars.exportify();

var toCompiledMustache = exporter( {
	translator: global.req( 'mustacheCompileTranslator' ),
	uiPath: 'build/mustache',
	source: [ '**/*.tmpl' ],
	dest: 'build/mstParsed/' // TODO: directory is resolved incorrectly if pass build/mustacheCompiled (puts in Compiled dir)
} );

toCompiledMustache.exportify();
