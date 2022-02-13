const request = require('request');
const _: any = require("lodash");
const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.sendFile('index.html', { root: __dirname })
})

app.get('/current', (req, res) => {
    res.sendFile('current.html', { root: __dirname })
})

app.get('/forecast', (req, res) => {
    res.sendFile('forecast.html', { root: __dirname })
})

app.get('/current/getWeather', (req, res) => {
    const { city } = req.query;
    request(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=9e08c47d966d4ab8155f0bc00f04baa7`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            let weather = JSON.parse(body).weather;
            res.json(weather)
        }
    })
})

app.get('/current/info', (req, res) => {
    request(`http://api.openweathermap.org/data/2.5/group?id=3173435,2643743,2147714&units=metric&appid=9e08c47d966d4ab8155f0bc00f04baa7`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            var temps: { temp: number, city: string }[] = [];
            var hums: { humidity: number, city: string }[] = [];
            _.each(info.list, i => {
                temps.push({
                    temp: i.main.temp,
                    city: i.name
                });
                hums.push({
                    humidity: i.main.humidity,
                    city: i.name
                });
            })
            //media delle temperature
            let avg: number = _.mean(_.map(temps, tmp => tmp.temp));

            //Umidità più alta
            let highHum: number = _.maxBy(hums, 'humidity');

            //Temperatura più alta
            let highTemp: number = _.maxBy(temps, 'temp');
            res.json({
                avg: avg,
                highest_humidity: highHum,
                highest_temperature: highTemp
            });
            
        }
    })

})

app.get('/forecast/getForecast', (req, res) => {
    const { city } = req.query;
    request(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=9e08c47d966d4ab8155f0bc00f04baa7`, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            let forecastWeather = JSON.parse(body).list;
            res.json(_.map(forecastWeather, weath => {
                return {
                    temp: _.get(weath, 'main.temp'),
                    humidity: _.get(weath, 'main.humidity'),
                    pressure: _.get(weath, 'main.pressure')
                }
            }))
        }
    })
})

app.listen(3000)