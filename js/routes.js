app.config(function ($routeProvider) {
	$routeProvider
		.when('/', {templateUrl: 'templates/page/game.html'})
		.when('/settings', {templateUrl: 'templates/page/settings.html'})
		.when('/info', {templateUrl: 'templates/page/info.html'})
		.otherwise({redirectTo: '/'});
});