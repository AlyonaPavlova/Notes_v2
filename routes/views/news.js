const keystone = require('keystone');

module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'news';
	view.render('news');
};
