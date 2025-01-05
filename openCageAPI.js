var http = require('http');

var getCoordinates = function (config, streetAddress) {
    return new Promise(function (resolve, reject) {
        var geocodeData = '';
        var url = 'http://api.opencagedata.com/geocode/v1/json?' +
            'key=' + config.openCageAPIKey +
            '&q=' + streetAddress +
            '&limit=4' +
            '&bounding=-123.067096,45.298819,-122.362598,45.605171' +
            '&countrycode=us' +
            '&no_annotations=1' +
            '&no_dedupe=1'
        http.get(url,
            function (res) {
                res.on('data', function (chunk) {
                    geocodeData += chunk.toString();
                });
                res.on('end', function () {
                    geocodeData = JSON.parse(geocodeData);
                    resolve(geocodeData.results[0]);
                });
                res.on('error', function (e) {
                    reject(e);
                })
            });
    })
}

module.exports = {getCoordinates: getCoordinates};
