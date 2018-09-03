const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Like Model
 * ==========
 */

const Like = new keystone.List('Like');

Like.add({
	user: { type: Types.Relationship, ref: 'User', index: true },
	note: { type: Types.Relationship, ref: 'Note', index: true },
	state: { type: Types.Boolean },
	
});

Like.register();
