const keystone = require('keystone');
const Types = keystone.Field.Types;

/**
 * User Model
 * ==========
 */
const User = new keystone.List('User', {
	nodelete: true,
});

User.add({
	name: { type: Types.Name, required: true, index: true },
	email: { type: Types.Email, initial: true, required: true, unique: true, index: true },
	password: { type: Types.Password, initial: true, required: true },
	phone: { type: String, width: 'short' },
	regDate: { type: Types.Date },
	birthDate: { type: Types.Date, initial: true },
	// photo: { type: Types.CloudinaryImage, collapse: true },
	notesCount: { type: Types.Number },
}, 'Permissions', {
	isAdmin: { type: Boolean, label: 'Can access Keystone', index: true },
});

// Provide access to Keystone
User.schema.virtual('canAccessKeystone').get(function () {
	return this.isAdmin;
});

User.relationship({ ref: 'Note', path: 'notes', refPath: 'author' });

User.schema.methods.wasActive = function () {
	this.lastActiveOn = new Date();
	return this;
};

/**
 * Registration
 */

User.track = true;
User.defaultColumns = 'name, email, isAdmin';
User.register();
