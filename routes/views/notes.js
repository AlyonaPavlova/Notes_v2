const keystone = require('keystone');
const async = require('async');

const Note = keystone.list('Note');

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Init locals
	locals.section = 'notes';
	locals.filters = {
		category: req.params.category,
	};
	locals.data = {
		notes: Note.model.find()
			.sort('-publishedAt')
			.limit(10)
			.exec()
			.then(function (notes) {
				return notes;
			}, function (err) {
				console.log(err);
			}),
		categories: [],
	};

	// Load all categories
	view.on('init', function (next) {

		keystone.list('PostCategory').model.find().sort('name').exec(function (err, results) {

			if (err || !results.length) {
				return next(err);
			}

			locals.data.categories = results;

			// Load the counts for each category
			async.each(locals.data.categories, function (category, next) {

				keystone.list('Note').model.count().where('categories').in([category.id]).exec(function (err, count) {
					category.noteCount = count;
					next(err);
				});

			}, function (err) {
				next(err);
			});
		});
	});

	// Load the current category filter
	view.on('init', function (next) {

		if (req.params.category) {
			keystone.list('PostCategory').model.findOne({ key: locals.filters.category }).exec(function (err, result) {
				locals.data.category = result;
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
			// filters: {
			// 	state: 'published',
			// },
		})
			.sort('-publishedDate')
			.populate('author categories');

		if (locals.data.category) {
			q.where('categories').in([locals.data.category]);
		}

		q.exec(function (err, results) {
			locals.data.posts = results;
			next(err);
		});
	});

	// Render the view
	view.render('notes');
};
