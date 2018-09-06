const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Like = keystone.list('Like').model;
const statistics = require('./statistics');

module.exports = async function (req, res) {
	const note = await Note.findOne({ slug: req.params.note });
	const currentState = await Like.findOne({ user: req.user._id, note: note._id });
	
	if (currentState === null) {
		await new Like({
			user: req.user,
			note: note,
			state: req.body.like 
		}).save().then(async () => {
			await statistics.newLikesCount(note.author);
			await statistics.getLikesCountByTenNotes(note.author);
			await statistics.getRating(note.author);
			await statistics.getRatingByLastTenNotes(note.author);
			
			res.redirect('/notes')
		}).catch(err => { return err });
	}

	await Like.findOne({ note: note }).then(record => {
		record.state = req.body.like;
		record.save();
	}).then(async () => {
		req.body.like ? await statistics.getLikesCount(note.author, 1) : await statistics.getLikesCount(note.author, -1);
		await statistics.getLikesCountByTenNotes(note.author);
		await statistics.getRating(note.author);
		await statistics.getRatingByLastTenNotes(note.author);

		res.redirect('/notes')
	}).catch(err => { return err });
};
