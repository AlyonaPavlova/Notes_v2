const keystone = require('keystone');

/**
 * Tag Model
 * ==================
 */

const Tag = new keystone.List('Tag', {
	autokey: { from: 'name', path: 'key', unique: true },
});

Tag.add({
	name: { type: String, required: true },
});

Tag.relationship({ ref: 'Note', path: 'notes', refPath: 'tags' });

Tag.register();
