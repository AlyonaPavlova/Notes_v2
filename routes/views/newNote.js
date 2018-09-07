'use strict';

const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;
const statistics = require('./statistics');

module.exports = async function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;

	locals.formData = req.body || {};
	locals.section = 'newNote';
	
	view.on('post', { action: 'note.create' }, async next => {
		const tagsArr = [];
		
		if (locals.formData.tags) {
			const tagsNamesArr = locals.formData.tags.split(', ');

			for (let i = 0; i < tagsNamesArr.length; i++) {
				await Tag.findOne({ name: tagsNamesArr[i] }).then(async tag => { 
					if (tag === null) {
						let newTag = await new Tag({ name: tagsNamesArr[i] }).save();
						tagsArr.push(newTag);
					} else { tagsArr.push(tag) }
				}).catch(err => next(err));
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
		}).save();
		
		await Promise.all([
			statistics.getUniqueTags(req.user._id),
			statistics.getLastTenNotes(req.user._id),
			statistics.coefficientOfActivity(req.user._id)
		]).then(() => res.redirect('/notes')).catch(err => next(err));
	});
	
	view.render('newNote');
};
