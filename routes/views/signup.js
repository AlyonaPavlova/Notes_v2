const keystone = require('keystone');

const User = keystone.list('User').model;
const Statistic = keystone.list('Statistic').model;

module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.formData = req.body || {};
	locals.section = 'signup';

	view.on('post', { action: 'user.create' }, async () => {
		await new User({
			name: {
				first: locals.formData.first,
				last: locals.formData.last,
			},
			email: locals.formData.email,
			password: locals.formData.password,
			phone: locals.formData.phone,
			birthDate: locals.formData.birthDate,
		}).save().then(async newUser => {
			await new Statistic({
				user: newUser,
				uniqueTags: [],
				lastTenNotes: [],
				likesCount: 0,
				likesCountByTenNotes: 0,
				rating: 0,
				ratingByLastTenNotes: 0,
				coefficientOfActivity: 0,
			}).save().catch(err => { return err });
			
			res.redirect('/keystone/signin')
		}).catch(err => { return err });
	});

	view.render('signup');
};
