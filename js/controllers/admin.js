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

	$scope.settings = {
		myApiFilmsToken: ''
	};

	if (typeof(Storage) !== "undefined") {
		if (localStorage.getItem("adminMyApiFilmsToken")) {
			$scope.settings.myApiFilmsToken = angular.fromJson(localStorage.getItem("adminMyApiFilmsToken"));
		}
	}

	$scope.movies = [];
	$scope.filteredMovies = [];
	$scope.updateAllInProgress = false;
	$scope.updateAllProgress = 0;
	$scope.pagination = {
		search: '',
		limit: 20,
		offset: 0,
		filtered: 0,
		currentPageIndex: 0
	};
	$scope.updateOptions = {
		onlyEmptyFields: true
	};

	// Init Movies
	MoviesDataService.getMovies().then(function (data) {
		$scope.movies = data;
	});

	// Watcher
	$scope.$watch('pagination', function (newValue, oldValue) {
		if(newValue.limit < 1){
			newValue.limit = 1;
		}
		$scope.filteredMovies = $scope.getFilteredMovies();
	}, true);

	$scope.$watchCollection('movies', function () {
		$scope.filteredMovies = $scope.getFilteredMovies();
	}, true);

	$scope.$watch('pagination.search', function () {
		$scope.goToPage(0);
	}, true);

	$scope.$watch('settings.myApiFilmsToken', function (newValue, oldValue) {
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("adminMyApiFilmsToken", JSON.stringify(newValue));
		}
	});

	// Methods
	$scope.getFilteredMovies = function () {
		return $filter('filter')($scope.movies, $scope.pagination.search);
	};

	$scope.getPages = function () {
		var length = Math.ceil($scope.filteredMovies.length / $scope.pagination.limit);
		if (isNaN(length)) {
			length = 0;
		}
		return new Array(length);
	};

	$scope.goToPage = function (pageIndex) {
		$scope.pagination.offset = $scope.pagination.limit * pageIndex;
		$scope.pagination.currentPageIndex = pageIndex;
	};

	$scope.addMovie = function () {
		$scope.movies.unshift({title: '', year: '', genres: [], imdbId: '', rating: '', germanTitle: ''});
	};

	$scope.removeMovie = function (movie) {
		$scope.movies.splice($scope.movies.indexOf(movie), 1);
	};

	$scope.save = function () {
		console.log(JSON.stringify($scope.movies));
	};

	// Methods for API Access
	$scope.updateInfoFromOmdb = function (index, all) {
		if (all) {
			$scope.updateAllInProgress = true;
		}

		var movie = $scope.movies[index];
		if ($scope.updateOptions.onlyEmptyFields && movie.title != '' && movie.year != '' && movie.rating != '' && movie.genres.length > 0) {
			console.log('no update needed for ', movie.title);
			$scope.proceedUpdate(all, index, 'updateInfoFromOmdb');
		} else {
			$http.get('http://www.omdbapi.com/?i=' + movie.imdbId + '&plot=full&r=json').then(function (response) {
				console.log('Updating ', movie.title, $scope.updateOptions.onlyEmptyFields);
				if (!response.data.error) {
					console.log(response);
					movie.title = (!$scope.updateOptions.onlyEmptyFields || movie.title == '') ? response.data.Title : movie.title;
					movie.year = (!$scope.updateOptions.onlyEmptyFields || movie.year == '') ? response.data.Year : movie.year;
					movie.rating = (!$scope.updateOptions.onlyEmptyFields || movie.rating == '') ? response.data.imdbRating : movie.rating;
					movie.genres = (!$scope.updateOptions.onlyEmptyFields || movie.genres.length == 0) ? response.data.Genre.split(',') : movie.genres;
				}
				$scope.proceedUpdate(all, index, 'updateInfoFromOmdb');
			});
		}

		if (all && $scope.updateAllProgress == 100) {
			$scope.updateAllInProgress = false;
		}
	};

	$scope.updateInfoFromMyApiFilms = function (index, all) {
		if (all) {
			$scope.updateAllInProgress = true;
		}

		var movie = $scope.movies[index];
		if ($scope.updateOptions.onlyEmptyFields && movie.germanTitle != '') {
			console.log('no update needed for ', movie.germanTitle);
			$scope.proceedUpdate(all, index, 'updateInfoFromMyApiFilms');
		} else {
			$http.jsonp('http://www.myapifilms.com/tmdb/movieInfoImdb', {
				params: {
					idIMDB: movie.imdbId,
					token: $scope.settings.myApiFilmsToken,
					format: 'json',
					language: 'de',
					callback: 'JSON_CALLBACK'
				}
			}).then(function (response) {
				if (!response.error) {
					var data = response.data.data;
					movie.germanTitle = (!$scope.updateOptions.onlyEmptyFields || movie.germanTitle == '') ? data.title : movie.germanTitle;
				}
				$scope.proceedUpdate(all, index, 'updateInfoFromMyApiFilms');
			});
		}

		if (all && $scope.updateAllProgress == 100) {
			$scope.updateAllInProgress = false;
		}
	};

	$scope.proceedUpdate = function (all, index, type) {
		if (all) {
			index++;
			$scope.updateAllProgress = Math.floor((index + 1) / $scope.movies.length * 100);
			if (index < $scope.movies.length) {
				if (type == 'updateInfoFromOmdb') {
					$scope.updateInfoFromOmdb(index, all);
				}
				if (type == 'updateInfoFromMyApiFilms') {
					$scope.updateInfoFromMyApiFilms(index, all);
				}
			}
		}
		return index;
	};
});