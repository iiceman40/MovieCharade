var app = angular.module('movieCharadeApp', ['ngRoute']);

document.addEventListener('deviceready', onDeviceReady, false);

window.onerror = function(a,b,c) {
	alert(a);
	alert(b);
	alert(c);
};

function onDeviceReady() {
	window.plugins.insomnia.keepAwake();
}

// MUST HAVE
// TODO add translations
// TODO add sound when the time runs out
// TODO reference a server side data source for the movies that can be updated

// NICE TO HAVE
// TODO styling
// TODO add filter for genre

// BACKLOG
// TODO refactor names that have "movie" inside to something more generic
// TODO separate into distinct controllers for team, game, movies, and info??
// TODO add services for settings, team and game data??