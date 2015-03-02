var Hapi = require('hapi');
var trimetAPI = require('./trimetAPI.js');
var mapQuestAPI = require('./mapQuestAPI.js');
var moment = require('moment');
var md5 = require('js-md5');
var configs = require('./gopdxServerConfig.js');
var fs = require('fs');
var searchStops = require('./searchStops.js');

var stopData = JSON.parse(fs.readFileSync('stops.json'));

var server = new Hapi.Server('localhost', 8000); //change this to ('http://my-server-url', 80) for production


var appVersion = configs.appVersion;
var serverVersion = configs.serverVersion;

server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply('<h1>gopdx API v' + serverVersion + '</h1>');
    }});

server.route({
    method: 'GET',
    path: '/appVersion',
    handler: function(request, reply) {
        return reply(JSON.stringify({appVersion:appVersion})).type('text/json');
    }
});

server.route({
    method: 'GET',
    path: '/arrivals/{stopID}',
    handler: function (request, reply) {
        var key = request.query.key || "";
        if (checkAuth(key)) {
            trimetAPI.getArrivals(request.params.stopID, reply);
        }
        else {
            reply('Unauthorized');
        }
    }
});

server.route({
    method: 'GET',
    path: '/coordinates/{streetAddress}',
    handler: function (request, reply) {
        var key = request.query.key || "";
        if(checkAuth(key)){
            mapQuestAPI.getCoordinates(request.params.streetAddress,
                function (coords) {
                    return reply(coords).type('text/json');
                }
            );
        }
        else{
            reply('Unauthorized');
        }

    }
});

server.route({
    method: 'GET',
    path: '/stops',
    handler: function (request, reply) {
        var key = request.query.key || "";
        if(checkAuth(key)){
            var coordinates = {};
            coordinates.lat = request.query.lat;
            coordinates.lng = request.query.lng;

            trimetAPI.locateStops(coordinates, reply)
        }
        else{
            reply('Unauthorized');
        }
    }
});

server.route(
    {
        method: 'GET',
        path: '/namesearch',
        handler: function(request, reply){
            var key = request.query.key || "";
            if(checkAuth(key)){

                var searchTerms = request.query.searchterms || "";
                if(searchTerms == ""){
                    var response = reply("No search terms provided");
                }
                var searchArray = searchTerms.split(" ");
                var itemsFound = searchStops(stopData, searchArray);
                if (itemsFound.length > 10){
                    reply(JSON.stringify({error:"More then 10 stops found, please refine your search."}));
                }
                if (itemsFound.length == 0){
                    reply(JSON.stringify({error:"No stops found."}));
                }
                reply(JSON.stringify(itemsFound));
            }
        }
    }
)

server.start(function (err) {
    if (err) {
        //console.log("The server couldn't be started! Error: " + err)
    }
    //console.log('Server started at: ' + server.info.uri);
});

function checkAuth(key) {
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
