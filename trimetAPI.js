var http = require('http');

var getArrivals = function (config, stopID) {
    return new Promise(function(resolve, reject) {
        var arrivalData = '';
        var jsonArrivals = '';
        http.get('http://developer.trimet.org/ws/v2/arrivals?locIDs=' + stopID + '&appID=' + config.trimetAppID,
            function (res) {
                res.on('data', function (chunk) {
                    arrivalData += chunk.toString();
                });
                res.on('end', function () {
                    resolve(arrivalData);
                });
                res.on('error', function (e) {
                    reject(e);
                })
            });
    })
}

var locateStops = function (config, coordinates){
    return new Promise(function(resolve, reject){
        var stops = '';
        http.get('http://developer.trimet.org/ws/v1/stops?' +
            'appID=' + config.trimetAppID +
            '&json=true' +
            '&ll=' + coordinates.lng + ',' + coordinates.lat +
            '&feet=650&showRouteDirs=true', function(res){
            res.on('data', function(chunk){
                stops += chunk.toString();
            });
            res.on('end', function(){
                //console.log("locateStops done.");
                resolve(stops);
            });
            res.on('error', function(e){
                reject(e);
            });
        })
    })
}

module.exports = {
    getArrivals: getArrivals,
    locateStops: locateStops
}