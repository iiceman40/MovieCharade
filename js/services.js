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
		},
		getMoviesFromHtml: function () {
			if (!promiseMovies) {
				promiseMovies = $http.get('top250.html').then(function (moviesResponse) {
					$('#movie-info').append(moviesResponse.data);
					var chart = $('#movie-info').find('table.chart');
					var movies = [];
					chart.find('tr').each(function(){
						var thisMovieInfo = $(this).find('td.titleColumn');
						var title = thisMovieInfo.find('> a').text();
						var year = parseInt(thisMovieInfo.find('span.secondaryInfo').text().replace('(', '').replace(')', ''));
						if(title && !isNaN(year)) {
							movies.push({
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