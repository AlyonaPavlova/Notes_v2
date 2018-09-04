const keystone = require('keystone');

const Statistic = keystone.list('Statistic').model;
const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;

module.exports = function (req, res) {
	const view = new keystone.View(req, res);
	const locals = res.locals;
	
	view.on('init', async function (next) {
		locals.firstName = req.user.name.first;
		locals.lastName = req.user.name.last;

		await Statistic.findOne({ user: req.user._id }).then(async user => {
			const tagsArr = [];
			
			for (let i = 0; i < user.uniqueTags.length; i++) {
				await Tag.findById(user.uniqueTags[i]).then(tag => tagsArr.push(tag.name)).catch(err => { return err });
			}
			
			locals.uniqueTagsNames = tagsArr.join(', ');
		}).catch(err => { return err });
		
		await Statistic.findOne({ user: req.user._id }).then(async user => {
			const notesArr = [];
			
			for (let i = 0; i < user.lastTenNotes.length; i++) {
				await Note.findById(user.lastTenNotes[i]).then(note => notesArr.push(note.title)).catch(err => { return err });
			}
			
			locals.lastTenNotes = notesArr.join(', ');
		}).catch(err => { return err });
		
		await Statistic.findOne({ user: req.user._id }).then(user => { locals.likesCount = user.likesCount }).catch(err => { return err });
		await Statistic.findOne({ user: req.user._id }).then(user => { locals.rating = user.rating }).catch(err => { return err });
		await Statistic.findOne({ user: req.user._id }).then(user => { locals.ratingByLastTenNotes = user.ratingByLastTenNotes }).catch(err => { return err });
		await Statistic.findOne({ user: req.user._id }).then(user => { locals.coefficientOfActivity = user.coefficientOfActivity }).catch(err => { return err });
		next();
	});

	view.render('statistics');
};
