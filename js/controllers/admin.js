app.controller('AdminController', function ($scope, $filter, $location, $http, MoviesDataService) {
	$scope.genres = [
		"Action",
		"Adventure",
		"Animation",
		"Biography",
		"Comedy",
		"Crime",
		"Documentary",
		"Drama",
		"Family",
		"Fantasy",
		"Film-Noir",
		"History",
		"Horror",
		"Music",
		"Musical",
		"Mystery",
		"Romance",
		"Sci-Fi",
		"Short",
		"Sport",
		"Thriller",
		"War",
		"Western"
	];

	$scope.movies = null;
	$scope.updateAllInProgress = false;
	$scope.updateAllProgress = 0;

	MoviesDataService.getMovies().then(function (data) {
		$scope.movies = data;
	});

	$scope.addMovie = function(){
		$scope.movies.unshift({title: '', year: '', genres: []});
	};

	$scope.save = function(){
		console.log(JSON.stringify($scope.movies));
	};

	$scope.updateInfo = function(index, all){
		if(all) {
			$scope.updateAllInProgress = true;
		}

		var movie = $scope.movies[index];
		$http.get('http://www.omdbapi.com/?i=' + movie.imdbId + '&plot=full&r=json').then(function (response) {
			console.log('Updating ', movie.title);
			if(!response.data.error) {
				console.log(response);
				movie.title = response.data.Title;
				movie.year = response.data.Year;
				movie.rating = response.data.imdbRating;
				movie.genres = response.data.Genre.split(',');
			}
			if(all) {
				index++;
				$scope.updateAllProgress = Math.floor((index + 1) / $scope.movies.length * 100);
				if (index < $scope.movies.length) {
					$scope.updateInfo(index, all);
				}
			}
		});

		if(all && $scope.updateAllProgress == 100) {
			$scope.updateAllInProgress = false;
		}
	}
});