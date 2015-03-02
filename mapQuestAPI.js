var http = require('http');
var config = require('./gopdxServerConfig.js');

var getCoordinates = function (streetAddress, callback) {
    var coordinates = {};
    var geocodeData = '';
    var latitude = 0, longitude = 0;

    var req = http.get('http://open.mapquestapi.com/geocoding/v1/address?' +
        'key=' + config.mapQuestAPIKey +
        '&location=' + streetAddress +
        '&maxResults=4' +
        '&boundingBox=45.605171,-123.067096,45.298819,-122.362598',
        function (res) {
            res.on('data', function (chunk) {
                geocodeData += chunk.toString();
            });

            res.on('end', function () {
                //console.log(geocodeData);
                geocodeData = JSON.parse(geocodeData);
                callback(geocodeData.results[0].locations);
            });

            res.on('error', function (e) {
                callback(e);
            })
        });

    req.on('error', function(e) {
        //console.log('problem with request: ' + e.message);
    });
}

module.exports = {getCoordinates: getCoordinates};
