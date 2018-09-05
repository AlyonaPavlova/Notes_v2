const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports =  async function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.section = 'note';
	
	// Load the current note
	view.on('init', async (next) => {
		const note = await Note.findOne({ slug: req.params.note }).populate('author').then(note => { return note }).catch(err => { return err });
		const tags = note.tags;
		const tagsNames = [];

		for (let i = 0; i < tags.length; i++) {
			await Tag.findById(tags[i]).then(tag => tagsNames.push(tag.name)).catch(err => { return err });
		}

		locals.data = { note: note };
		locals.tags = tagsNames.join(', ');
		next();
	});

	view.render('note');
};
