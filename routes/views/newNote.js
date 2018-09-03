const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.formData = req.body || {};
	locals.section = 'newNote';
	
	view.on('post', { action: 'note.create' }, async () => {
		const tagsArr = [];
		
		if (locals.formData.tags) {
			const tagsNamesArr = locals.formData.tags.split(', ');

			for (let i = 0; i < tagsNamesArr.length; i++) {
				await Tag.findOne({ name: tagsNamesArr[i] }).then(async tag => { 
					if (tag === null) {
						let newTag = await new Tag({ name: tagsNamesArr[i] }).save().catch(err => { return err });
						tagsArr.push(newTag);
					} else {
						const oldTag = await Tag.findOne({ name: tagsNamesArr[i] }).then(tag => { return tag }).catch(err => { return err });
						tagsArr.push(oldTag);
					}
				}).catch(err => { return err });
			}
		}

		await new Note({
			title: locals.formData.title,
			author: req.user,
			publishedDate: new Date(),
			content: {
				brief: locals.formData.brief,
				extended: locals.formData.extended,
			},
			tags: tagsArr,
			tagsCount: tagsArr.length,
		}).save().then(() => res.redirect('/notes')).catch(err => { return err });
	});
	
	view.render('newNote');
};
