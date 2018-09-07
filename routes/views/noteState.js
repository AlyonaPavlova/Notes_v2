'use strict';

const keystone = require('keystone');
const _ = require('lodash');

const Note = keystone.list('Note').model;
const Like = keystone.list('Like').model;
const statistics = require('./statistics');

module.exports = async function (req, res) {
	const note = await Note.findOne({ slug: req.params.note });
	const currentState = await Like.findOne({ user: req.user._id, note: note._id });
	const lastTenNotes = await Note.find({ author: note.author }).sort('-publishedDate').limit(10);
	const noteInTheLastTen = _.unionBy(lastTenNotes, note);

	if (currentState === null) {
		await new Like({
			user: req.user,
			note: note,
			state: req.body.like 
		}).save().then(async () => {
			req.body.like ? await statistics.getLikesCount(note.author, 1) : await statistics.getLikesCount(note.author, -1);
			
			if (noteInTheLastTen !== null) {
				req.body.like ? await statistics.getLikesCountByTenNotes(note.author, 1) : await statistics.getLikesCountByTenNotes(note.author, -1);
			}
			
			await Promise.all([
				statistics.getRating(note.author),
			 	statistics.getRatingByLastTenNotes(note.author)
			]).then(() => res.redirect('/notes')).catch(err => { return err });
		}).catch(err => { return err });
	}

	await Like.findOne({ note: note }).then(record => {
		record.state = req.body.like;
		record.save();
	}).then(async () => {
		if (currentState.state === true && !req.body.like) await statistics.getLikesCount(note.author, -1);
		if (currentState.state === false && req.body.like) await statistics.getLikesCount(note.author, 1);

		if (noteInTheLastTen !== null) {
			if (currentState.state === true && !req.body.like) await statistics.getLikesCountByTenNotes(note.author, -1);
			if (currentState.state === false && req.body.like) await statistics.getLikesCountByTenNotes(note.author, 1);
		}

		await Promise.all([
			statistics.getRating(note.author),
			statistics.getRatingByLastTenNotes(note.author)
		]).then(() => res.redirect('/notes')).catch(err => { return err });
	}).catch(err => { return err });
};
