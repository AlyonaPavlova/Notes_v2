const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Like = keystone.list('Like').model;
const statistics = require('./statistics');

module.exports = async function (req, res) {
	const note = await Note.findOne({ slug: req.params.note }).then(note => { return note }).catch(err => { return err });
	const authorNote = await Note.findById(note._id).then(note => { return note.author }).catch(err => { return err });
	const currentState = await Like.findOne({ user: req.user._id, note: note._id }).then(state => { return state }).catch(err => { return err });
	
	let state;
	(req.body.true !== undefined) ? state = true : state = false;

	if (currentState === null) {
		await new Like({
			user: req.user,
			note: note,
			state: state 
		}).save().then(async () => {
			await statistics.getLikesCount(authorNote);
			await statistics.getLikesCountByTenNotes(authorNote);
			await statistics.getRating(authorNote);
			await statistics.getRatingByLastTenNotes(authorNote);
			res.redirect('/notes')
		}).catch(err => { return err });
	} 
	await Like.update(
		{ note: note },
		{ $set: { state: state } }
	).then(async () => {
		await statistics.getLikesCount(authorNote);
		await statistics.getLikesCountByTenNotes(authorNote);
		await statistics.getRating(authorNote);
		await statistics.getRatingByLastTenNotes(authorNote);
		res.redirect('/notes')
	}).catch(err => { return err });
};
