app.controller('GameController', function ($scope, $filter, $location, MoviesDataService) {
	// SETTINGS
	$scope.settings = {
		time: 60,
		maxDiscards: 1,
		maxPoints: 5
	};
	// TEAMS
	$scope.teams = [];
	$scope.currentTeam = null;
	// GAME STATE
	// 0 - not started
	// 1 - game in progress
	// 2 - game finished
	$scope.gameState = 0;
	// TURN ACTIONS
	$scope.currentMovie = null;
	$scope.timerTimeout = null;
	$scope.discardsUsed = 0;
	// TURN STATE
	// 0 - waiting for team ready
	// 1 - team is ready, movie is drawn
	$scope.turnState = 0;
	// FILTER
	$scope.filter = {
		minYear: 1900,
		maxYear: 2100
	};
	// MOVIE LISTS
	$scope.movies = null;
	$scope.discardedMovies = [];
	$scope.successfullyGuessedMovies = [];

	$scope.buzz = new Audio("audio/buzz.mp3");

	// init teams, settings and filter from local storage
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
		if (localStorage.getItem("filter")) {
			$scope.filter = angular.fromJson(localStorage.getItem("filter"));
		}
	} else {
		// Sorry! No Web Storage support..
	}

	// WATCHER
	$scope.$watch('settings', function(){
		$scope.saveSettings();
	}, true);
	$scope.$watch('teams', function(){
		$scope.saveTeams();
	}, true);
	$scope.$watch('filter', function(){
		$scope.saveFilter();
	}, true);

	$scope.$watch('currentTeam', function(newValue, oldValue){
		$scope.checkForMaxPointsReached();
	});

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

	MoviesDataService.getMovies().then(function (data) {
		$scope.movies = data;
	});

	$scope.numberOfAvailableMovies = function () {
		var count = $scope.getFilteredMovies().length - $scope.getFilteredDiscardedMovies().length - $scope.getFilteredSuccessfullyGuessedMovies().length;
		var numberOfMoviesNeededToCompleteRound = $scope.teams.length - ($scope.teams.indexOf($scope.currentTeam) + 1);
		if (count - numberOfMoviesNeededToCompleteRound <= 0) {
			if ($scope.gameState == 1) {
				$scope.gameState = 2;
			}
		}
		return count;
	};

	$scope.checkForMaxPointsReached = function(){
		if($scope.currentTeam == $scope.teams[0]){
			for(var i = 0; i < $scope.teams.length; i++){
				var team = $scope.teams[i];
				if(team.points >= $scope.settings.maxPoints){
					$scope.stopGame();
					return true;
				}
			}
		}
		return false;
	};

	$scope.getHighestPoints = function(){
		var maxPoints = 0;
		for(var i = 0; i < $scope.teams.length; i++){
			var team = $scope.teams[i];
			if(team.points > maxPoints){
				maxPoints = team.points;
			}
		}
		return maxPoints;
	};

	$scope.movieSuccessfullyGuessed = function () {
		$scope.checkForMaxPointsReached();
		$scope.stopTimer();
		$scope.discardsUsed = 0;
		if ($scope.currentMovie) {
			$scope.successfullyGuessedMovies.push($scope.currentMovie);
		}
		$scope.currentMovie = null;
		$scope.currentTeam.points++;
		$scope.turnState = 0;
		$scope.currentTeam = $scope.nextTeam();
	};

	$scope.discardMovie = function () {
		if ($scope.currentMovie) {
			$scope.discardedMovies.push($scope.currentMovie);
		}
		$scope.discardsUsed++;
		$scope.getRandomMovie();
	};

	$scope.startExplaining = function () {
		$scope.turnState = 2;
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
			} else {
				$scope.buzz.play();
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
	};

	$scope.removeTeam = function (team) {
		$scope.teams.splice($scope.teams.indexOf(team), 1);
	};

	$scope.teamReady = function () {
		$scope.checkForMaxPointsReached();
		$scope.turnState = 1;
		$scope.timer = $scope.settings.time.toFixed(2);
		$scope.getRandomMovie();
	};

	$scope.teamIsActive = function (team) {
		return $scope.gameState != 1 || team == $scope.currentTeam;
	};

	$scope.toggleEditTeam = function (team) {
		team.edit = !team.edit;
	};

	$scope.startGame = function () {
		if ($scope.teams.length) {
			$scope.currentTeam = $scope.teams[0];
			$scope.timer = $scope.settings.time.toFixed(2);
			$scope.gameState = 1;
		}
	};

	$scope.stopGame = function(){
		$scope.stopTimer();
		$scope.gameState = 2;
	};

	$scope.saveTeams = function(){
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("teams", JSON.stringify($scope.teams));
		}
	};

	$scope.saveSettings = function(){
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("settings", JSON.stringify($scope.settings));
		}
	};

	$scope.saveFilter = function(){
		if (typeof(Storage) !== "undefined") {
			localStorage.setItem("filter", JSON.stringify($scope.filter));
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
		if ($scope.numberOfAvailableMovies() > 0) {
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
		$scope.gameState = 0;
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