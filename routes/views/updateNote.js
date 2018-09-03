const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = async function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.formData = req.body || {};
	locals.section = 'updateNote';
	
	const note = await Note.findOne({ slug: req.params.note }).then(note => { return note }).catch(err => { return err });
	const tags = note.tags;
	const tagsNames = [];
	
	for (let i = 0; i < tags.length; i++) {
		await Tag.findById(tags[i]).then(tag => tagsNames.push(tag.name)).catch(err => { return err });
	}

	locals.note = note;
	locals.tags = tagsNames.join(', ');

	view.on('post', { action: 'note.update' }, async () => {
		const tagsArr = [];
		const oldTagsArr = [];
		
		if (req.body.tags) {
			const tagsNamesArr = req.body.tags.split(', ');

			for (let i = 0; i < tagsNamesArr.length; i++) {
				await Tag.findOne({ name: tagsNamesArr[i] }).then(async tag => { 
					if (tag === null) {
						const newTag = await new Tag({ name: tagsNamesArr[i] }).save().catch(err => { return err });
						tagsArr.push(newTag);
					} else {
						const oldTag = await Tag.findOne({ name: tagsNamesArr[i] }).then(tag => { return tag }).catch(err => { return err });
						oldTagsArr.push(oldTag);
					} }).catch(err => { return err });
			}
		}
		
		if (tagsArr !== null && oldTagsArr !== null) {
			const allTags = oldTagsArr.concat(tagsArr);
			console.log(allTags);
			await Note.update(
				{ _id: note.id },
				{ $set: { title: locals.formData.title,
						publishedDate: new Date(),
						content: {
							brief: locals.formData.brief,
							extended: locals.formData.extended,
						},
						tags: allTags,
						tagsCount: allTags.length }
				}).then(() => res.redirect('/notes')).catch(err => { return err });
		}

		if (tagsArr !== null && oldTagsArr === null) {
			await Note.update(
				{ _id: note.id },
				{ $set: { title: locals.formData.title,
						publishedDate: new Date(),
						content: {
							brief: locals.formData.brief,
							extended: locals.formData.extended,
						},
						tags: tagsArr,
						tagsCount: tagsArr.length }
				}).then(() => res.redirect('/notes')).catch(err => { return err });
		}

		if (tagsArr === null && oldTagsArr !== null) {
			await Note.update(
				{ _id: note.id },
				{ $set: { title: locals.formData.title,
						publishedDate: new Date(),
						content: {
							brief: locals.formData.brief,
							extended: locals.formData.extended,
						} }
				}).then(() => res.redirect('/notes')).catch(err => { return err });
		}
		
	});
	
	view.render('updateNote');
};
