/* Connexion à la base de donnée */

require("../utils/database");

const mongoose = require('mongoose')

// describe("UserService", () => {
//     require("./services/UserService.test");
// });

// describe("UserController", () => {
//     require("./controllers/UserController.test")
// })

// describe("SettingService", () => {
//     require('./services/SettingService.test')
// })

// describe("SettingController", () => {
//     require("./controllers/SettingController.test")
// })

// describe("WeatherService", () => {
//     require("./services/WeatherService.test")
// })

describe("WeatherController", () => {
    require("./controllers/WeatherController.test")
})

describe("API - Mongo", () => {
    it("Vider les dbs. - S", () => {
        if (process.env.npm_lifecycle_event == 'test')
            mongoose.connection.db.dropDatabase();
    })
})
