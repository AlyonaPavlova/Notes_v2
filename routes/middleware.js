/**
 * This file contains the common middleware used by your routes.
 *
 * Extend or replace these functions as your application requires.
 *
 * This structure is not enforced, and just a starting point. If
 * you have more middleware you may want to group it as separate
 * modules in your project's /lib directory.
 */
const _ = require('lodash');
const keystone = require('keystone');
const Note = keystone.list('Note').model;

/**
	Initialises the standard view locals

	The included layout depends on the navLinks array to generate
	the navigation in the header, you may wish to change this array
	or replace it with your own templates / logic.
*/
exports.initLocals = function (req, res, next) {
	res.locals.navLinks = [
		{ label: 'Home', key: 'home', href: '/' },
		{ label: 'Notes', key: 'notes', href: '/notes' },
		{ label: 'News', key: 'news', href: '/news' },
		{ label: 'Features', key: 'features', href: '/features' },
	];
	res.locals.user = req.user;
	next();
};


/**
	Fetches and clears the flashMessages before a view is rendered
*/
exports.flashMessages = function (req, res, next) {
	const flashMessages = {
		info: req.flash('info'),
		success: req.flash('success'),
		warning: req.flash('warning'),
		error: req.flash('error'),
	};
	res.locals.messages = _.some(flashMessages, function (msgs) { return msgs.length; }) ? flashMessages : false;
	next();
};


/**
	Prevents people from accessing protected pages when they're not signed in
 */
exports.requireUser = function (req, res, next) {
	if (!req.user) {
		req.flash('error', 'Please sign in to access this page.');
		res.redirect('/keystone/signin');
	} else {
		next();
	}
};

exports.checkIdMiddleware = async function (req, res, next) {
	const note = await Note.findOne({ slug: req.params.note });
	
	if (req.user !== undefined) {
		await Note.findOne({ _id: note._id }).then(note => {
			if (req.user._id.toString() === note.author.toString()) {
				return next();
			}
			res.send('You are not the author of this note, so you don\'t have permission to edit it.');
		}).catch(err => { next(err) });
	} else {
		res.redirect('/signup');
	}
};
