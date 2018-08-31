const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.formData = req.body || {};
	locals.section = 'newNote';
	
	view.on('post', { action: 'note.create' }, () => {
		const tagsArr = [];
		
		if (locals.formData.tags) {
			const tagsNamesArr = locals.formData.tags.split(', ');

			for (let i = 0; i < tagsNamesArr.length; i++) {
				let newTag = new Tag({ name: tagsNamesArr[i] });

				tagsArr.push(newTag);

				Tag.findOne({ name: tagsNamesArr[i] }).exec((err, tag) => {
					if (err) return err;
					if (!tag) { newTag.save().catch(err => console.log(err)); }
				});
			}
		}

		const newNote = new Note({
			title: locals.formData.title,
			author: req.user,
			publishedDate: new Date(),
			content: {
				brief: locals.formData.brief,
				extended: locals.formData.extended,
			},
			tags: tagsArr,
			tagsCount: tagsArr.length,
		});

		newNote.save().then(() => res.redirect('/notes')).catch(err => console.log(err));
	});
	
	view.render('newNote');
};
