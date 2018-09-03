/**
 * This file is where you define your application routes and controllers.
 *
 * Start by including the middleware you want to run for every request;
 * you can attach middleware to the pre('routes') and pre('render') events.
 *
 * For simplicity, the default setup for route controllers is for each to be
 * in its own file, and we import all the files in the /routes/views directory.
 *
 * Each of these files is a route controller, and is responsible for all the
 * processing that needs to happen for the route (e.g. loading data, handling
 * form submissions, rendering the view template, etc).
 *
 * Bind each route pattern your application should respond to in the function
 * that is exported from this module, following the examples below.
 *
 * See the Express application routing documentation for more information:
 * http://expressjs.com/api.html#app.VERB
 */

const keystone = require('keystone');
const middleware = require('./middleware');
const importRoutes = keystone.importer(__dirname);
const noteState = require('./views/noteState');

// Common Middleware
keystone.pre('routes', middleware.initLocals);
keystone.pre('render', middleware.flashMessages);

// Import Route Controllers
const routes = {
	views: importRoutes('./views'),
};

// Setup Route Bindings
module.exports = function (app) {
	app.get('/', routes.views.index);
	app.get('/news', routes.views.news);
	app.get('/features', routes.views.features);
	
	app.get('/notes/:tag?', routes.views.notes);
	app.get('/note/:note', routes.views.note);

	app.get('/signup', routes.views.signup);
	app.post('/signup', routes.views.signup);

	app.get('/new-note', routes.views.newNote);
	app.post('/new-note', routes.views.newNote);

	app.get('/update-note/:note', middleware.checkIdMiddleware, routes.views.updateNote);
	app.post('/update-note/:note', routes.views.updateNote);

	app.post('/note/:note/state', noteState);


	// NOTE: To protect a route so that only admins can see it, use the requireUser middleware:
	// app.get('/protected', middleware.requireUser, routes.views.protected);
};
