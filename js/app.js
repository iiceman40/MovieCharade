var app = angular.module('movieCharadeApp', ['ngRoute']);
var buzzSound = "audio/buzz.mp3";
var lowLatencyAudio = null;

document.addEventListener('deviceready', onDeviceReady, false);

window.onerror = function (a, b, c) {
	alert(a);
	alert(b);
	alert(c);
};

function onDeviceReady() {
	window.plugins.insomnia.keepAwake();

	if (window.plugins && window.plugins.LowLatencyAudio) {
		lowLatencyAudio = window.plugins.LowLatencyAudio;
		// preload audio resource
		lowLatencyAudio.preloadFX(buzzSound, buzzSound, 1, function (msg) {
		}, function (msg) {
			alert('error: ' + msg);
		});
	}
}

// MUST HAVE
// TODO add sound when the time runs out
// TODO reference a server side data source for the movies that can be updated
// TODO add translations

// NICE TO HAVE
// TODO styling
// TODO add filter for genre

// BACKLOG
// TODO refactor names that have "movie" inside to something more generic
// TODO separate into distinct controllers for team, game, movies, and info??
// TODO add services for settings, team and game data??