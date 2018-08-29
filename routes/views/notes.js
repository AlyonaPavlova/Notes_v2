const keystone = require('keystone');
const async = require('async');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Init locals
	locals.section = 'notes';
	locals.filters = {
		category: req.params.tag,
	};
	locals.data = {
		notes: [],
		tags: [],
	};

	// Load all categories
	view.on('init', function (next) {

		keystone.list('Tag').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.tags = results;

			// Load the counts for each category
			async.each(locals.data.tags, function (tag, next) {

				keystone.list('Note').model.count().where('tags').in([tag.id]).exec(function (err, count) {
					tag.noteCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current category filter
	view.on('init', function (next) {

		if (req.params.tag) {
			keystone.list('Tag').model.findOne({ key: locals.filters.tag }).exec(function (err, result) {
				locals.data.tag = result;
				next(err);
			});
		} else {
			next();
		}
	});

	// Load the notes
	view.on('init', function (next) {

		let q = keystone.list('Note').paginate({
			page: req.query.page || 1,
			perPage: 10,
			maxPages: 10,
			filters: {
				state: 'published',
			},
		})
			.sort('-publishedDate')
			.populate('author tags');

		if (locals.data.tag) {
			q.where('tags').in([locals.data.tag]);
		}

		q.exec(function (err, results) {
			locals.data.notes = results;
			next(err);
		});
	});

	// Render the view
	view.render('notes');
};
