var http = require('http');
var config = require('./gopdxServerConfig.js');

var getArrivals = function (stopID, callback) {
    var arrivalData = '';
    var jsonArrivals = '';
    http.get('http://developer.trimet.org/ws/v2/arrivals?locIDs=' + stopID + '&appID=' + config.trimetAppID,
        function (res) {
            res.on('data', function (chunk) {
                arrivalData += chunk.toString();
            });

            res.on('end', function () {

                callback(arrivalData);
            });

            res.on('error', function (e) {
                callback(e);
            })
        });
}

var locateStops = function (coordinates, callback){

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
            callback(stops);
        });
        res.on('error', function(e){
            callback(e);
        });
    })
}

module.exports = {
    getArrivals: getArrivals,
    locateStops: locateStops
}