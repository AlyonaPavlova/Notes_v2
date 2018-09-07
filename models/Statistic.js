const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * Statistic Model
 * ==========
 */
const Statistic = new keystone.List('Statistic');

Statistic.add({
	user: { type: Types.Relationship, ref: 'User', index: true },
	uniqueTags: { type: Types.Relationship, ref: 'Tag', many: true },
	lastTenNotes: { type: Types.Relationship, ref: 'Note', many: true },
	likesCount: { type: Types.Number },
	likesCountByTenNotes: { type: Types.Number },
	rating: { type: Types.Number },
	ratingByLastTenNotes: { type: Types.Number },
	coefficientOfActivity: { type: Types.Number },
});

Statistic.register();
