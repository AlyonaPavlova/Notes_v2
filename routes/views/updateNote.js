const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = async function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.formData = req.body || {};
	locals.section = 'updateNote';
	
	const note = await Note.findOne({ slug: req.params.note }).exec((err, note) => {
		if (err) return err;
		return note;
	});

	const tags = note.tags;
	const tagsNames = [];
	
	for (let i = 0; i < tags.length; i++) {
		await Tag.findOne({ _id: tags[i] }).exec((err, tag) => {
			if (err) return err;
			tagsNames.push(tag.name);
		});
	}

	locals.note = note;
	locals.tags = tagsNames.join(', ');

	view.on('post', { action: 'note.update' }, () => {
		const tagsArr = [];

		if (req.body.tags) {
			const tagsNamesArr = req.body.tags.split(', ');

			for (let i = 0; i < tagsNamesArr.length; i++) {
				let newTag = new Tag({ name: tagsNamesArr[i] });

				tagsArr.push(newTag);

				Tag.findOne({ name: tagsNamesArr[i] }).exec((err, tag) => {
					if (err) return err;
					if (!tag) { newTag.save().catch(err => console.log(err)); }
				});
			}
		}
		
		Note.updateOne(
			{ _id: note.id },
			{ $set: {title: req.body.title,
				author: req.user,
				publishedDate: new Date(),
				content: {
					brief: locals.formData.brief,
					extended: locals.formData.extended,
				},
				tags: tagsArr,
				tagsCount: tagsArr.length }}).then(() => res.redirect('/')).catch(err => console.log(err));
	});

	view.render('updateNote');
};
