const keystone = require('keystone');

module.exports =  async function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.section = 'note';
	locals.filters = {
		note: req.params.note,
	};
	locals.data = {
		note: [],
	};
	
	const note = await keystone.list('Note').model.findOne({ slug: req.params.note }).then(note => { return note }).catch(err => { return err });
	const tags = note.tags;
	const tagsNames = [];

	for (let i = 0; i < tags.length; i++) {
		await keystone.list('Tag').model.findById(tags[i]).then(tag => tagsNames.push(tag.name)).catch(err => { return err });
	}
	
	locals.tags = tagsNames.join(', ');

	// Load the current note
	view.on('init', function (next) {

		const q = keystone.list('Note').model.findOne({
			state: 'published',
			slug: locals.filters.note,
		}).populate('author categories');

		q.exec(function (err, result) {
			locals.data.note = result;
			next(err);
		});

	});

	// Load other notes
	view.on('init', function (next) {

		const q = keystone.list('Note').model.find().where('state', 'published').sort('-publishedDate').populate('author').limit('10');

		q.exec(function (err, results) {
			locals.data.notes = results;
			next(err);
		});

	});

	view.render('note');
};
