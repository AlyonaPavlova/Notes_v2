const keystone = require('keystone');

/**
 * PostCategory Model
 * ==================
 */

const PostCategory = new keystone.List('PostCategory', {
	autokey: { from: 'name', path: 'key', unique: true },
});

PostCategory.add({
	name: { type: String, required: true },
});

PostCategory.relationship({ ref: 'Note', path: 'notes', refPath: 'categories' });

PostCategory.register();
