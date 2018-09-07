const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports =  async function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'note';
	
	// Load the current note
	view.on('init', async (next) => {
		const note = await Note.findOne({ slug: req.params.note }).populate('author tags');

		locals.data = { note: note };
		next();
	});

	view.render('note');
};
