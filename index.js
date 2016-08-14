var Factual = require('factual-api');
var express = require('express');
var moment = require('moment');
var conf = require('./conf');

// const userTime = require('userTime');             //  get current time of user
// const userLatitude = require('userLatitude');     // get current latitude of user
// const userLongitude = require('userLongitude');   // get current longitude of user
// const userSearchRadius = require('userSearchRadius'); //get user search radius in meters (m)

var WEEKDAYS = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

var factual = new Factual(conf.factualKey, conf.factualSecret);
var app = express();

app.get('/', function(req, res) { //reuqesting location, timestamp, and searchRadius from frontend
  res.send(req.query);
});

app.get('/factualInfos', function(req, serverResponse) {

  var location = req.query.location || [ 37.7822671,-122.3934366 ];
  var timestamp = req.query.timestamp || 1455139168717;
  var searchRadius = req.query.searchRadius || 100;

  factualOptions = {
    geo: {
      "$circle": {
        "$center": location,
        "$meters": searchRadius
      }
    }
  }

  factual.get('/t/restaurants-us',factualOptions, function (error, res) {
    var deviceTime = new Date(timestamp);
    console.log(deviceTime);
    var openRestaurants = returnOpenRestaurants(res.data, deviceTime);
    console.log(openRestaurants);
    serverResponse.json(openRestaurants); //server responds to the frontend with openRestaurants
  });
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

// @param [time] string in format hr:mm
// @return [int] time as float
function convertStringtoTime(time) {
  var timeArray = time.split(':');
  return parseInt(timeArray[0]) + parseInt(timeArray[1]) / 60;
}


function returnOpenRestaurants(restaurants, timeIn) {
  var dataOut = [];

  var weekday = WEEKDAYS[timeIn.getDay()];
  var currentTime = timeIn.getHours() + timeIn.getMinutes() / 60;

  var startTime;
  var endTime;

  console.log(restaurants.length);
  // We only want restaurants with hours
  var restaurantsWithHours = restaurants.filter(function(restaurant) {
    return !!restaurant.hours; // Return true if hours exist
  });
  console.log(restaurantsWithHours.length);

  for (i = 0; i < restaurantsWithHours.length; i++) {
    var currentRestaurant = restaurantsWithHours[i];
    for(j = 0; j < currentRestaurant.hours[weekday].length; j++) {
      startTime = convertStringtoTime(currentRestaurant.hours[weekday][j][0]);
      endTime = convertStringtoTime(currentRestaurant.hours[weekday][j][1]);

      console.log("currentTime: " + currentTime);
      console.log("startTime: " + startTime);
      console.log("endTime: " + endTime);

      if(currentTime >= startTime && currentTime < endTime){
        dataOut.push(currentRestaurant);
        break;
      }
    }
  }

  return dataOut;
}
