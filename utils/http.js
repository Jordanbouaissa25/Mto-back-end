const axios = require('axios')

module.exports.http = axios.create({
    baseURL: "https://api.openweathermap.org/data/2.5/weather"
})
