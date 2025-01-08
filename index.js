const Hapi = require('@hapi/hapi');
var trimetAPI = require('./trimetAPI.js');
var openCageAPI = require('./openCageAPI.js');
var moment = require('moment');
var md5 = require('js-md5');
var fs = require('fs');
var searchStops = require('./searchStops.js');

var host = '209.38.79.121';
var port = 80;

var configs =
    {
        appVersion: '0.1.24',
        serverVersion: '0.1.24',
        trimetAppID:process.env.TRIMET_APP_ID,
        openCageAPIKey: process.env.OPENCAGE_API_KEY
    }
if (process.env.GOPDX_DEV == 'true'){
    host = 'localhost';
    port = 8000;
}
var stopData = JSON.parse(fs.readFileSync('stops.json'));

const init = async () => {

    const server = Hapi.server({
        port: port,
        host: host
    });
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, h) {
            return('<h1>gopdx API v' + serverVersion + '</h1>');
        }});

    server.route({
        method: 'GET',
        path: '/appVersion',
        handler: function(request, h) {
            return h.response(JSON.stringify({appVersion:appVersion})).type('text/json');
        }
    });

    server.route({
        method: 'GET',
        path: '/arrivals/{stopID}',
        handler: function (request, h) {
            var key = request.query.key || "";
            if (checkAuth(key)) {
                return trimetAPI.getArrivals(configs, request.params.stopID);
            }
            else {
                return('Unauthorized');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/coordinates/{streetAddress}',
        handler: function (request, h) {
            var key = request.query.key || "";
            if(checkAuth(key)){
                return openCageAPI.getCoordinates(configs, request.params.streetAddress);
            }
            else {
                return('Unauthorized');
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/stops',
        handler: function (request, h) {
            var key = request.query.key || "";
            if(checkAuth(key)){
                var responseData = "";
                var coordinates = {};
                coordinates.lat = request.query.lat;
                coordinates.lng = request.query.lng;
                return trimetAPI.locateStops(configs, coordinates);
            }
            else{
                return('Unauthorized');
            }
        }
    });

    server.route(
        {
            method: 'GET',
            path: '/namesearch',
            handler: function(request, h){
                var key = request.query.key || "";
                if(checkAuth(key)){

                    var searchTerms = request.query.searchterms || "";
                    if(searchTerms == ""){
                        return "No search terms provided";
                    }
                    var searchArray = searchTerms.split(" ");
                    var itemsFound = searchStops(stopData, searchArray);
                    if (itemsFound.length > 10){
                        return(JSON.stringify({error:"More then 10 stops found, please refine your search."}));
                    }
                    if (itemsFound.length == 0){
                        return(JSON.stringify({error:"No stops found."}));
                    }
                    return(JSON.stringify(itemsFound));
                } else return "Invalid key"
            }
        }
    )

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

var appVersion = configs.appVersion;
var serverVersion = configs.serverVersion;

init();

function checkAuth(key) {
    return true
    var keys = [];
    var now = moment.utc();
    for (var i = 0; i < 10; i++) {
        keys.push(md5(now.hours().toString() + " " + now.day().toString() + i.toString()), true);
    }
    if (keys.indexOf(key) > -1) {
        return true;
    }
    if (key.indexOf(key) == -1) {
        return true
    }
}
