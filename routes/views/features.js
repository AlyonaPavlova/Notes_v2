const keystone = require('keystone');

module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.section = 'features';
	view.render('features');
};
