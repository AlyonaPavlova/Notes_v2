'use strict';

const keystone = require('keystone');

const Statistic = keystone.list('Statistic').model;
const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = async function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	view.on('init', async next => {
		locals.firstName = req.user.name.first;
		locals.lastName = req.user.name.last;

		await Promise.all([
			Statistic.findOne({ user: req.user._id }).then(async user => {
				const tagsArr = [];

				for (let i = 0; i < user.uniqueTags.length; i++) {
					await Tag.findById(user.uniqueTags[i]).then(tag => tagsArr.push(tag.name));
				}

				locals.uniqueTagsNames = tagsArr.join(', ');
			}),

			Statistic.findOne({ user: req.user._id }).then(async user => {
			const notesArr = [];

			for (let i = 0; i < user.lastTenNotes.length; i++) {
				await Note.findById(user.lastTenNotes[i]).then(note => notesArr.push(note.title));
			}

			locals.lastTenNotes = notesArr.join(', ');
			}),
			Statistic.findOne({ user: req.user._id }).then(user => { locals.likesCount = user.likesCount }),
			Statistic.findOne({ user: req.user._id }).then(user => { locals.rating = user.rating }),
			Statistic.findOne({ user: req.user._id }).then(user => { locals.ratingByLastTenNotes = user.ratingByLastTenNotes }),
			Statistic.findOne({ user: req.user._id }).then(user => { locals.coefficientOfActivity = user.coefficientOfActivity })
		]).then(() => next()).catch(err => next(err));
	});

	view.render('statistics');
};
