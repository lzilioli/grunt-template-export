module.exports = {
	js: {
		files: [ '<%= vars.paths.js %>' ],
		tasks: [ 'jsbeautifier', 'jshint' ]
	}
};
