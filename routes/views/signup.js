const keystone = require('keystone');
const User = keystone.list('User').model;

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.formData = req.body || {};
	locals.section = 'signup';

	view.on('post', { action: 'user.create' }, function () {
		const newUser = new User({
			name: {
				first: locals.formData.first,
				last: locals.formData.last,
			},
			email: locals.formData.email,
			password: locals.formData.password,
			phone: locals.formData.phone,
			birthDate: locals.formData.birthDate,
		});

		newUser.save(function (err) {
			if (err) {
				return console.log(err);
			} else {
				return res.redirect('/');
			}
		});
	});

	// Render the view
	view.render('signup');
};
