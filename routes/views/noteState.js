const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Like = keystone.list('Like').model;

module.exports = async function (req, res) {
	const note = await Note.findOne({ slug: req.params.note }).then(note => { return note }).catch(err => { return err });
	const currentState = await Like.findOne({ user: req.user, note: note }).then(state => { return state }).catch(err => { return err });

	let state;
	(req.body.true !== undefined) ? state = true : state = false;

	if (currentState === null) {
		await new Like({
			user: req.user,
			note: note,
			state: state 
		}).save().then(() => res.redirect('/notes')).catch(err => { return err });
	} 
	await Like.update(
		{ note: note },
		{ $set: { state: state } }
	).then(() => res.redirect('/notes')).catch(err => { return err });
};
