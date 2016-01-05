app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'templates/admin/movies.html'})
		.when('/pending', {templateUrl: 'templates/admin/pending.html'})
		.when('/settings', {templateUrl: 'templates/admin/settings.html'})
		.otherwise({redirectTo: '/'});
});