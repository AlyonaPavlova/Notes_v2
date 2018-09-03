const keystone = require('keystone');

const Note = keystone.list('Note').model;
const Tag = keystone.list('Tag').model;
const Like = keystone.list('Like').model;

module.exports = async function (req, res) {
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
	const getTags = uniqueTagsNames.join(', ');
	
	res.send(getTags);
};
