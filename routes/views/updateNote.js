const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = async function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.formData = req.body || {};
	locals.section = 'updateNote';
	
	const note = await Note.findOne({ slug: req.params.note }).populate('tags');
	const tagsNames = [];

	for (let i = 0; i < note.tags.length; i++) {
		tagsNames.push(note.tags[i].name);
	}

	locals.note = note;
	locals.tags = tagsNames.join(', ');

	view.on('post', { action: 'note.update' }, async next => {
		const tagsArr = [];
		const oldTagsArr = [];
		
		if (req.body.tags) {
			const tagsNamesArr = req.body.tags.split(', ');

			for (let i = 0; i < tagsNamesArr.length; i++) {
				await Tag.findOne({ name: tagsNamesArr[i] }).then(async tag => { 
					if (tag === null) {
						let newTag = await new Tag({ name: tagsNamesArr[i] }).save();
						tagsArr.push(newTag);
					} else { oldTagsArr.push(tag) } 
				}).catch(err => next(err));
			}
		}
		
		async function noteUpdate(tagsArr) {
			await Note.findById(note.id).then(note => {
				note.title = locals.formData.title;
				note.publishedDate = new Date();
				note.brief = locals.formData.brief;
				note.extended = locals.formData.extended;
				note.content = {
					brief: note.brief,
					extended: note.extended
				};
				note.tags = tagsArr;
				note.tagsCount = tagsArr.length;

				note.save();
				res.redirect('/notes');
			}).catch(err => next(err));
		}

		if (tagsArr && oldTagsArr) await noteUpdate(oldTagsArr.concat(tagsArr));
		if (tagsArr && !oldTagsArr) await noteUpdate(tagsArr);
		if (!tagsArr && oldTagsArr) await noteUpdate(oldTagsArr);
	});
	
	view.render('updateNote');
};
