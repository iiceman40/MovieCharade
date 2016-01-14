app.directive('moviepanel', function () {
	return {
		restrict: 'E',
		scope: {
			movie: '=',
			type: '@'
		},
		templateUrl: "templates/page/movies/moviePanel.html"
	}
});