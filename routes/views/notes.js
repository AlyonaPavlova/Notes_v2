'use strict';

const keystone = require('keystone');
const async = require('async');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = async function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'notes';
	locals.filters = { tag: req.query.filter };
	locals.data = {
		notes: [],
		tags: [],
	};

	// Load all tags
	view.on('init', async next => {
		await Tag.find().sort('name').then((results) => {
			locals.data.tags = results;

			// Load the counts for each tag
			async.each(locals.data.tags, (tag, next) => {
				Note.count().where('state', 'published').where('tags').in([tag.id]).then(count => { tag.noteCount = count }).catch(err => next(err));
			});
		}).catch(err => next(err));
		next();
	});

	// Load the current tag filter
	view.on('init', async next => {
		req.query.filter ? await Tag.findOne({ key: locals.filters.tag }).exec((err, result) => { locals.data.tag = result; next(err) }) : next();
	});

	// Load the notes
	view.on('init', async next => {
		let notes = keystone.list('Note').paginate({
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: { state: 'published' }
		}).sort('-publishedDate').populate('author tags');

		if (locals.data.tag) {
			notes.where('tags').in([locals.data.tag]);
		}

		notes.exec((err, results) => { locals.data.notes = results; next(err) });
	});

	view.render('notes');
};
