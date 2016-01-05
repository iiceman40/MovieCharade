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

// TODO settings for max points
// TODO accordion for settings
// TODO cancel game button
// TODO add german movie title to current movie panel
// TODO add translations
// TODO hide "Spiel starten" Button when no team is available
// TODO add field for german title
// TODO add sound when the time runs out

// TODO admin settings for tokens

// TODO reference a server side data source for the movies that can be updated
// TODO styling
// TODO refactor names that have "movie" inside to something more generic
// TODO add filter for genre

// TODO separate into distinct controllers for team, game, movies, and info??
// TODO add services for settings, team and game data??