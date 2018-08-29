const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Note Model
 * ==========
 */
const Note = new keystone.List('Note', {
	map: { name: 'title' },
	autokey: { path: 'slug', from: 'title', unique: true },
});

Note.add({
	title: { type: String, required: true },
	state: { type: Types.Select, options: 'draft, published, archived', default: 'draft', index: true },
	author: { type: Types.Relationship, ref: 'User', index: true },
	publishedDate: { type: Types.Date, index: true, dependsOn: { state: 'published' } },
	content: {
		brief: { type: Types.Html, wysiwyg: true, height: 150 },
		extended: { type: Types.Html, wysiwyg: true, height: 400 },
	},
	tags: { type: Types.Relationship, ref: 'Tag', many: true },
	tagsCount: { type: Types.Number },
});

Note.schema.virtual('content.full').get(function () {
	return this.content.extended || this.content.brief;
});

Note.track = true;
Note.defaultColumns = 'title, state|20%, author|20%, publishedDate|20%';
Note.register();
