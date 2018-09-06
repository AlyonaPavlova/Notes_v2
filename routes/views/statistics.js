const keystone = require('keystone');
const _ = require('lodash');

const User = keystone.list('User').model;
const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;
const Like = keystone.list('Like').model;
const Statistic = keystone.list('Statistic').model;

exports.getUniqueTags = async function (userId) {
	const notes = await Note.find({ author: userId }).populate('tags');
	let tags = notes[0].tags;
	
	for (let i = 0; i < notes.length; i++) {
		tags = tags.concat(notes[i].tags);
	}
	
	const uniqueTags = _.uniqBy(tags, '_id');
	
	await Statistic.findOne({ user: userId }).then(user => {
		user.uniqueTags = uniqueTags;
		user.save();
	}).catch(err => { return err });
};

exports.getLastTenNotes = async function (userId) {
	const lastTenNotes = await Note.find({ author: userId }).sort({'date': -1}).limit(10);

	await Statistic.findOne({ user: userId }).then(user => {
		user.lastTenNotes = lastTenNotes;
		user.save();
	}).catch(err => { return err });
};

exports.getLikesCount = async function (userId, act) {
	await Statistic.update({ user: userId }, { $inc: { likesCount: act} }).catch(err => { return err });
};

exports.newLikesCount = async function (userId) {
	const notes = await Note.find({ author: userId });
	let likesCount = 0;

	for (let i = 0; i < notes.length; i++) {
		let record = await Like.findOne({ note: notes[i]._id, state: true });
		if (record !== null) likesCount++
	}
	await Statistic.update({ user: userId }, { $set: { likesCount:  likesCount} }).catch(err => { return err });
};

exports.getRating = async function (userId) {
	const usersArr = await Statistic.find().sort('-likesCount').limit(100).then(list => { return list }).catch(err => { return err });

	usersArr.forEach(async (user, i) => {
		if (JSON.stringify(user.user) === JSON.stringify(userId)) {
			await Statistic.update({ user: userId }, { $set: { rating: i + 1 } }).catch(err => { return err });
		}
	}); 
};

exports.getLikesCountByTenNotes = async function (userId) {
	const lastTenNotes = await Note.find({ author: userId }).sort('-publishedDate').limit(10).then(notes => { return notes }).catch(err => { return err });
	let likesCount = 0;

	for (let i = 0; i < lastTenNotes.length; i++) {
		let record = await Like.findOne({ note: lastTenNotes[i]._id, state: true }).then(record => { return record }).catch(err => { return err });
		if (record !== null) likesCount++
	}
	await Statistic.update({ user: userId }, { $set: { likesCountByTenNotes:  likesCount} }).catch(err => { return err });
};

exports.getRatingByLastTenNotes = async function (userId) {
	const usersArr = await Statistic.find().sort('-likesCountByTenNotes').limit(100).then(list => { return list }).catch(err => { return err });
	
	usersArr.forEach(async (user, i) => {
		if (JSON.stringify(user.user) === JSON.stringify(userId)) {
			await Statistic.update({ user: userId }, { $set: { ratingByLastTenNotes: i + 1 } }).catch(err => { return err });
		}
	});
};

exports.coefficientOfActivity = async function (userId) {
	const user = await User.findById(userId);
	const currentDate = new Date();
	const different = (currentDate - user.regDate) / 1000 / 60 / 60 / 24;

	const notes = await Note.count({ author: userId });
	const number = (different / notes) * (1/10);
	const coefficient = +number.toFixed(2);

	await Statistic.findOne({ user: userId }).then(user => {
		user.coefficientOfActivity = coefficient;
		user.save();
	}).catch(err => { return err });
};

