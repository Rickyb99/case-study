var request = require('request');
var _ = require("lodash");
var express = require('express');
var app = express();
app.get('/', function (req, res) {
    res.sendFile('index.html', { root: __dirname });
});
app.get('/current', function (req, res) {
    res.sendFile('current.html', { root: __dirname });
});
app.get('/forecast', function (req, res) {
    res.sendFile('forecast.html', { root: __dirname });
});
app.get('/current/getWeather', function (req, res) {
    var city = req.query.city;
    request("https://api.openweathermap.org/data/2.5/weather?q=".concat(city, "&appid=9e08c47d966d4ab8155f0bc00f04baa7"), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var weather = JSON.parse(body).weather;
            res.json(weather);
        }
    });
});
app.get('/current/info', function (req, res) {
    request("http://api.openweathermap.org/data/2.5/group?id=3173435,2643743,2147714&units=metric&appid=9e08c47d966d4ab8155f0bc00f04baa7", function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var temps = [];
            var hums = [];
            _.each(info.list, function (i) {
                temps.push({
                    temp: i.main.temp,
                    city: i.name
                });
                hums.push({
                    humidity: i.main.humidity,
                    city: i.name
                });
            });
            //media delle temperature
            var avg = _.mean(_.map(temps, function (tmp) { return tmp.temp; }));
            //Umidità più alta
            var highHum = _.maxBy(hums, 'humidity');
            //Temperatura più alta
            var highTemp = _.maxBy(temps, 'temp');
            res.json({
                avg: avg,
                highest_humidity: highHum,
                highest_temperature: highTemp
            });
        }
    });
});
app.get('/forecast/getForecast', function (req, res) {
    var city = req.query.city;
    request("https://api.openweathermap.org/data/2.5/forecast?q=".concat(city, "&units=metric&appid=9e08c47d966d4ab8155f0bc00f04baa7"), function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var forecastWeather = JSON.parse(body).list;
            res.json(_.map(forecastWeather, function (weath) {
                return {
                    temp: _.get(weath, 'main.temp'),
                    humidity: _.get(weath, 'main.humidity'),
                    pressure: _.get(weath, 'main.pressure')
                };
            }));
        }
    });
});
app.listen(3000);
