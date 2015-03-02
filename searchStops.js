function searchStops(stopData, query) {

    var results = {};

    function recursiveSearch(stopData, query) {
        if (stopData.length == 0) return stopData;
        if (query.length == 0) return stopData;
        var tempResults = [];
        var searchTerm = query.shift();
        for (i = 0; i < stopData.length; i++) {
            var stop = stopData[i];
            var stopName = stop.stop_name.toLowerCase();
            var stopDescription = stop.stop_desc.toLowerCase();
            if ((stopName.indexOf(searchTerm.toLowerCase()) != -1) || (stopDescription.indexOf(searchTerm.toLowerCase()) != -1)) {
                tempResults.push(stop);
            }
        }
        results = tempResults;
        recursiveSearch(tempResults, query);
    }

    recursiveSearch(stopData, query);

    return (results);
}

module.exports = searchStops;