const keystone = require('keystone');

const User = keystone.list('User').model;
const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;
const Like = keystone.list('Like').model;
const Statistic = keystone.list('Statistic').model;

exports.getUniqueTags = async function (user) {
	const notes = await Note.find({ author: user._id }).then(notes => { return notes }).catch(err => { return err });
	const allTags = [];
	const tagsNames = [];
	const obj = {};

	for (let i = 0; i < notes.length; i++) {
		let tags = notes[i].tags;
		for (let i = 0; i < tags.length; i++) {
			allTags.push(tags[i]);
		}
	}

	for (let i = 0; i < allTags.length; i++) {
		let tag = await Tag.findById(allTags[i]).then(tag => { return tag }).catch(err => { return err });
		tagsNames.push(tag.name);
	}

	for (let i = 0; i < tagsNames.length; i++) {
		obj[tagsNames[i]] = true;
	}

	const uniqueTagsNames = Object.keys(obj);
	const uniqueTags = [];

	for (let i = 0; i < uniqueTagsNames.length; i++) {
		let tag = await Tag.findOne({ name: uniqueTagsNames[i] }).then(tag => { return tag }).catch(err => { return err });
		uniqueTags.push(tag);
	}
	
	await Statistic.update({ user: user._id }, { $set: { uniqueTags:  uniqueTags} }).catch(err => { return err });
};

exports.getLastTenNotes = async function (user) {
	const lastTenNotes = await Note.find({ author: user._id }).sort({'date': -1}).limit(10).then(notes => { return notes }).catch(err => { return err });
	
	await Statistic.update({ user: user._id }, { $set: { lastTenNotes:  lastTenNotes} }).catch(err => { return err });
};

exports.getLikesCount = async function (userId) {
	const notes = await Note.find({ author: userId }).then(notes => { return notes }).catch(err => { return err });
	let likesCount = 0;
	
	for (let i = 0; i < notes.length; i++) {
		let record = await Like.findOne({ note: notes[i]._id, state: true }).then(record => { return record }).catch(err => { return err });
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
	const regDate = await User.findById(userId).then(user => { return user.regDate }).catch(err => { return err });
	const currentDate = new Date();
	const different = (currentDate - regDate) / 1000 / 60 / 60 / 24;

	const notes = await Note.count({ author: userId }).then(notes => { return notes }).catch(err => { return err });
	const number = (different / notes) * (1/10);
	const coefficient = +number.toFixed(2);

	await Statistic.update({ user: userId }, { $set: { coefficientOfActivity: coefficient } }).catch(err => { return err });
};

