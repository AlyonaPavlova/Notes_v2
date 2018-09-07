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

exports.getLikesCountByTenNotes = async function (userId, act) {
	await Statistic.update({ user: userId }, { $inc: { likesCountByTenNotes: act} }).catch(err => { return err });
};

exports.getRating = async function (userId) {
	const usersArr = await Statistic.find().sort('-likesCount');
	const maxLikes = usersArr[0].likesCount;

	usersArr.forEach(async user => {
		let rating = (user.likesCount * 100) / maxLikes;
		
		if (JSON.stringify(user.user) === JSON.stringify(userId)) {
			await Statistic.findOne({ user: userId }).then(user => {
				user.rating = rating;
				user.save();
			}).catch(err => { return err });
		}
	});
};

exports.getRatingByLastTenNotes = async function (userId) {
	const usersArr = await Statistic.find().sort('-likesCountByTenNotes');
	const maxLikes = usersArr[0].likesCount;
	
	usersArr.forEach(async user => {
		let rating = (user.likesCount * 100) / maxLikes;

		if (JSON.stringify(user.user) === JSON.stringify(userId)) {
			await Statistic.findOne({ user: userId }).then(user => {
				user.ratingByLastTenNotes = rating;
				user.save();
			}).catch(err => { return err });
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

