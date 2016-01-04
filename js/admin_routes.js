app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'templates/admin/movies.html'})
		.when('/pending', {templateUrl: 'templates/admin/pending.html'})
		.when('/info', {templateUrl: 'templates/admin/info.html'})
		.otherwise({redirectTo: '/'});
});