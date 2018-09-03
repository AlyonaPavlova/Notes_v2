const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;
const Like = keystone.list('Like').model;
const Statistic = keystone.list('Statistic').model;

exports.getUniqueTags = async function (req, res) {
	const notes = await Note.find({ author: req.user }).then(notes => { return notes }).catch(err => { return err });
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
	await Statistic.update({ user: req.user }, { $set: { uniqueTags:  uniqueTags} }).catch(err => { return err });
	res.send(uniqueTagsNames.join(', '));
};

exports.getLastTenNotes = async function (req, res) {
	const lastTenNotes = await Note.find({ author: req.user }).sort({'date': -1}).limit(10).then(notes => { return notes }).catch(err => { return err });
	res.send(lastTenNotes);
};

exports.getLikesCount = async function (req, res) {
	let likesCount = 0;
	for (let i = 0; i < notes.length; i++) {
		let record = await Like.findOne({ note: notes[i]._id, state: true }).then(record => { return record }).catch(err => { return err });
		if (record !== null) likesCount++
	}
	res.send(likesCount.toString());
};

exports.getRating = async function (req, res) {
	
};
