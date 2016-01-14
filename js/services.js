/**
 * Services
 */
app.factory('MoviesDataService', function ($http) {
	var promiseMovies = null;

	return {
		getMovies: function () {
			if (!promiseMovies) {
				promiseMovies = $http.get('http://p215008.mittwaldserver.info/MovieCharade/db/load_movies.php').then(function (moviesResponse) {
					// SUCCESS
					return JSON.parse(moviesResponse.data.movies);
				}, function errorCallback(response) {
					// error
					promiseMovies = $http.get('data/movies.json').then(function (moviesResponse) {
						return moviesResponse.data;
					});
				});
			}
			return promiseMovies;
		},
		getMoviesFromHtml: function () {
			if (!promiseMovies) {
				promiseMovies = $http.get('data/top250.html').then(function (moviesResponse) {
					var infoArea = $('#movie-info');
					infoArea.append(moviesResponse.data);

					var chart = infoArea.find('table.chart');
					var movies = [];
					chart.find('tr').each(function(){
						var thisMovieInfo = $(this).find('td.titleColumn');
						var title = thisMovieInfo.find('> a').text();
						var year = parseInt(thisMovieInfo.find('span.secondaryInfo').text().replace('(', '').replace(')', ''));
						var imdbId = $(this).find('td.ratingColumn .seen-widget').data('titleid');
						if(title && !isNaN(year)) {
							movies.push({
								imdbId: imdbId,
								title: title,
								year: year,
								genres: []
							});
						}
					});
					console.log(JSON.stringify(movies));
					return movies;
				});
			}
			return promiseMovies;
		}
	};

});