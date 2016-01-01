var app = angular.module('movieCharadeApp', []);

/**
 * Controller
 */

// TODO add genre
// TODO styling

// List
app.controller('MoviesCtrl', function ($scope, $filter, $location, MoviesDataService) {
	$scope.settings = {
		time: 60,
		maxDiscards: 1
	};

	$scope.currentMovie = null;
	$scope.teams = [];
	$scope.currentTeam = null;
	$scope.timerTimeout = null;
	$scope.discardsUsed = 0;
	$scope.gameStatus = 0;

	// filter
	$scope.filter = {
		minYear: 1900,
		maxYear: 2100
	};

	// movie lists
	$scope.movies = null;
	$scope.discardedMovies = [];
	$scope.successfullyGuessedMovies = [];

	// init teams and settings from local storage
	if (typeof(Storage) !== "undefined") {
		var teams = angular.fromJson(localStorage.getItem("teams"));
		if (teams) {
			for (var i = 0; i < teams.length; i++) {
				$scope.teams.push({
					name: teams[i].name,
					color: teams[i].color,
					points: 0,
					edit: false
				});
			}
		}
		if (localStorage.getItem("settings")) {
			$scope.settings = angular.fromJson(localStorage.getItem("settings"));
		}
	} else {
		// Sorry! No Web Storage support..
	}

	$scope.timer = $scope.settings.time.toFixed(2);

	// filtered movie lists
	$scope.getFilteredMovies = function () {
		return $filter('yearFilter')($scope.movies, $scope.filter.minYear, $scope.filter.maxYear);
	};
	$scope.getFilteredDiscardedMovies = function () {
		return $filter('yearFilter')($scope.discardedMovies, $scope.filter.minYear, $scope.filter.maxYear);
	};
	$scope.getFilteredSuccessfullyGuessedMovies = function () {
		return $filter('yearFilter')($scope.successfullyGuessedMovies, $scope.filter.minYear, $scope.filter.maxYear);
	};

	$scope.availableMoviesNumber = function () {
		var count = $scope.getFilteredMovies().length - $scope.getFilteredDiscardedMovies().length - $scope.getFilteredSuccessfullyGuessedMovies().length;
		if (count - ($scope.teams.length - ($scope.teams.indexOf($scope.currentTeam) + 1)) <= 0) {
			$scope.gameStatus = 2;
		}
		return count;
	};

	MoviesDataService.getMovies().then(function (data) {
		$scope.movies = data;
	});

	$scope.movieSuccessfullyGuessed = function () {
		$scope.stopTimer();
		$scope.discardsUsed = 0;
		if ($scope.currentMovie) {
			$scope.successfullyGuessedMovies.push($scope.currentMovie);
		}
		$scope.currentMovie = null;
		$scope.currentTeam.points++;
		$scope.currentTeam = $scope.nextTeam();
	};

	$scope.discardMovie = function () {
		if ($scope.currentMovie) {
			$scope.discardedMovies.push($scope.currentMovie);
		}
		$scope.discardsUsed++;
		$scope.getRandomMovie();
	};

	$scope.teamReady = function () {
		$scope.getRandomMovie();
		$scope.startTimer();
	};

	$scope.startTimer = function () {
		$scope.timer = $scope.settings.time.toFixed(2);
		$scope.decreaseTimer();
	};

	$scope.decreaseTimer = function () {
		$scope.timerTimeout = setTimeout(function () {
			$scope.$apply(function () {
				$scope.timer = (parseFloat($scope.timer) - 0.1).toFixed(2);
			});
			if ($scope.timer > 0) {
				$scope.decreaseTimer();
			}
		}, 100);
	};

	$scope.stopTimer = function () {
		clearTimeout($scope.timerTimeout);
	};

	$scope.nextTeam = function () {
		var currentTeamIndex = $scope.teams.indexOf($scope.currentTeam);
		return $scope.teams[(currentTeamIndex + 1 < $scope.teams.length) ? currentTeamIndex + 1 : 0];
	};

	$scope.addTeam = function () {
		$scope.teams.push({
			name: 'neues Team',
			color: $scope.getRandomColor(),
			points: 0,
			edit: false
		});
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("teams", JSON.stringify($scope.teams));
		}
	};

	$scope.removeTeam = function (team) {
		$scope.teams.splice($scope.teams.indexOf(team), 1);
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("teams", JSON.stringify($scope.teams));
		}
	};

	$scope.teamIsActive = function (team) {
		return $scope.gameStatus != 1 || team == $scope.currentTeam;
	};

	$scope.toggleEditTeam = function (team) {
		team.edit = !team.edit;
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("teams", JSON.stringify($scope.teams));
		}
	};

	$scope.startGame = function () {
		if ($scope.teams.length) {
			$scope.currentTeam = $scope.teams[0];
			$scope.timer = $scope.settings.time.toFixed(2);
			if (typeof(Storage) !== "undefined") {
				localStorage.setItem("teams", JSON.stringify($scope.teams));
				localStorage.setItem("settings", JSON.stringify($scope.settings));
			}
			$scope.gameStatus = 1;
		}
	};

	$scope.endTurn = function () {
		$scope.stopTimer();
		$scope.discardsUsed = 0;
		$scope.timer = $scope.settings.time.toFixed(2);
		if ($scope.currentMovie) {
			$scope.discardedMovies.push($scope.currentMovie);
		}
		$scope.currentMovie = null;
		$scope.currentTeam = $scope.nextTeam();
	};

	$scope.getRandomMovie = function () {
		var filteredMovies = $scope.getFilteredMovies();
		var filteredDiscardedMovies = $scope.getFilteredDiscardedMovies();
		var filteredSuccessfullyGuessedMovies = $scope.getFilteredSuccessfullyGuessedMovies();
		if ($scope.availableMoviesNumber() > 0) {
			var newMovie = filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
			while (
			filteredDiscardedMovies.indexOf(newMovie) != -1 ||
			filteredSuccessfullyGuessedMovies.indexOf(newMovie) != -1
				) {
				newMovie = filteredMovies[Math.floor(Math.random() * filteredMovies.length)];
			}
		} else {
			newMovie = null;
		}

		$scope.currentMovie = newMovie;
	};

	$scope.resetStack = function () {
		$scope.discardedMovies = [];
		$scope.successfullyGuessedMovies = [];
		for (var i = 0; i < $scope.teams.length; i++) {
			$scope.teams[i].points = 0;
		}
		$scope.currentMovie = null;
		$scope.gameStatus = 0;
	};

	$scope.getRandomColor = function () {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}

});

/**
 * Filters
 */
app.filter('yearFilter', function () {
	return function (items, minYear, maxYear) {
		var filteredItems = [];
		angular.forEach(items, function (item, key) {
			if (item && item.hasOwnProperty('year')) {
				if (item.year <= maxYear && item.year >= minYear) {
					filteredItems.push(item);
				}
			}
		});
		return filteredItems;
	};
});

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