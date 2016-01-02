/**
 * Services
 */
app.factory('MoviesDataService', function ($http) {
	var promiseMovies = null;

	return {
		getMovies: function () {
			if (!promiseMovies) {
				promiseMovies = $http.get('data/movies.json').then(function (moviesResponse) {
					return moviesResponse.data;
				});
			}
			return promiseMovies;
		}
	};

});