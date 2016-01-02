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