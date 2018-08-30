const keystone = require('keystone');
const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

exports = module.exports = function (req, res) {

	const view = new keystone.View(req, res);
	const locals = res.locals;

	// Set locals
	locals.formData = req.body || {};
	locals.section = 'newNote';

	view.on('post', { action: 'note.create' }, function () {
		const allTagsArr = [];

		if (locals.formData.tags) {
			const tags = locals.formData.tags;
			const arrTags = tags.split(', ');

			for (let i = 0; i < arrTags.length; i++) {
				let newTag = new Tag({
					name: arrTags[i],
				});

				allTagsArr.push(newTag);

				let tag = Tag.findOne({ name: arrTags[i] });
				tag.exec(function (err, tag) {
					if (err) return err;
					if (!tag) {
						newTag.save(function (err) {
							if (err) {
								return console.log(err);
							}
						});
					}
				});
			}
		}

		const newNote = new Note({
			title: locals.formData.title,
			state: 'published',
			author: req.user,
			publishedDate: new Date(),
			content: {
				brief: locals.formData.brief,
				extended: locals.formData.extended,
			},
			tags: allTagsArr,
			tagsCount: allTagsArr.length,
		});

		newNote.save(function (err) {
			if (err) {
				return console.log(err);
			} else {
				console.log(newNote);
				return res.redirect('/notes');
			}
		});
	});

	// Render the view
	view.render('newNote');

};
