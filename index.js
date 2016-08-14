var Factual = require('factual-api');
var express = require('express');
var moment = require('moment');
var conf = require('./conf');

var WEEKDAYS = ["sunday","monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

var factual = new Factual(conf.factualKey, conf.factualSecret);
var app = express();

app.get('/factualInfos', function(req, serverResponse) {

  factualOptions = {
    geo: {
      "$circle": {
        "$center": [ 37.782047, -122.391248],
        "$meters": 100
      }
    }
  }

  factual.get('/t/restaurants-us',factualOptions, function (error, res) {
    var deviceTime = new Date(1455139168717);
    console.log(deviceTime);
    var openRestaurants = returnOpenRestaurants(res.data, deviceTime);
    console.log(openRestaurants);
    serverResponse.json(openRestaurants);
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
