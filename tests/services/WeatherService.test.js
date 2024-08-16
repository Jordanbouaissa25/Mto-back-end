const WeatherService = require("../../services/WeatherService");
const UserService = require("../../services/UserService")
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var id_weather_valid = "";
var tab_id_weathers = [];
var weathers = [];

var tab_id_users = []
let users = [
    {
        firstName: "Détenteur du weather 1",
        lastName: "Iencli",
        username: "ouil",
        email: "iencli@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du weather 2",
        lastName: "Loup",
        username: "allo",
        email: "aryatte@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du weather 3",
        lastName: "mnm",
        username: "ayooooo",
        email: "tchao@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du weather 4",
        lastName: "djo",
        username: "edupont",
        email: "edupont@gmail.com",
        password: "hello"
    }
];

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}



describe("addOneWeather", () => {
    it("Création des utilisateurs fictif", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            tab_id_users = _.map(value, "_id")
            done()
        })
    })
    it("Weather correct. - S", (done) => {
        var weather = {
            temp: 32,
            wind: "km/h",
            city: "Bali",
            humidity: 22,
            user_id: rdm_user(tab_id_users)
        };
        WeatherService.addOneWeather(weather, null, function (err, value) {
            // console.log(err, value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_weather_valid = value._id;
            weathers.push(value);
            done()
        });
    });

    it("Weather incorrect. (Sans city) - E", () => {
        var weather_no_valid = {
            temp: 30,
            wind: "kmp/h",
            humidity: 29,
            user_id: rdm_user(tab_id_users)
        };
        WeatherService.addOneWeather(weather_no_valid, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
            expect(err).to.haveOwnProperty("fields");
            expect(err["fields"]).to.haveOwnProperty("city");
            expect(err["fields"]["city"]).to.equal(
                "Path `city` is required."
            );
        });
    });
});

describe("addManyWeathers", () => {
    it("weathers à ajouter, non valide. - E", (done) => {
        var weathers_tab_error = [
            {
                temp: 30,
                wind: "kdsokdm/h",
                city: "dlkjjs",
                humidity: 20,
                user_id: rdm_user(tab_id_users)
            },
            {
                temp: 25,
                wind: "kxkockm/h",
                city: "Montbélcskl,siard",
                humidity: 20,
                user_id: rdm_user(tab_id_users)
            },
        ];

        WeatherService.addManyWeathers(weathers_tab_error, function (err, value) {
            done();
        });
    });

    it("Weathers à ajouter, valide. - S", (done) => {
        var weathers_tab = [
            {
                temp: 40,
                wind: "km/h",
                city: "Hurghada",
                humidity: 50,
                user_id: rdm_user(tab_id_users)
            },
            {
                temp: 25,
                wind: "mi/h",
                city: "Bali",
                humidity: 70,
                user_id: rdm_user(tab_id_users)
            },
        ];

        WeatherService.addManyWeathers(weathers_tab, function (err, value) {
            tab_id_weathers = _.map(value, "_id");
            weathers = [...value, ...weathers];
            //  console.log(value)
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("findOneWeather", () => {
    it("Chercher un Weather par les champs sélectionné. - S", (done) => {
        WeatherService.findOneWeather(["city"], weathers[0].city, null, function (err, value) {
            // console.log(weathers[0])
            // console.log(err, value)
            expect(value).to.haveOwnProperty('humidity');
            done();
        });
    });
    it("Chercher un Weather avec un champ non autorisé. - E", (done) => {
        WeatherService.findOneWeather(["temp", "wind"], weathers[0].city, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un Weather sans tableau de champ. - E", (done) => {
        WeatherService.findOneWeather("city", weathers[0].city, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un Weather inexistant. - E", (done) => {
        WeatherService.findOneWeather(["city"], "non-existent-city", null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });
});

describe("findOneWeatherById", () => {
    it("Chercher un weather existant correct. - S", (done) => {
        WeatherService.findOneWeatherById(id_weather_valid, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("wind");
            done();
        });
    });


    it("Chercher un Weather non-existant correct. - E", (done) => {
        WeatherService.findOneWeatherById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            done();
        });
    });
});

describe("findManyweathers", () => {
    it("Retourne 2 weathers. - S", (done) => {
        WeatherService.findManyWeathers(null, 1, 2, null, function (err, value) {
            //console.log(err, value)
            expect(value).to.haveOwnProperty("count");
            expect(value).to.haveOwnProperty("results");
            //      expect(value["name"]).to.be.equal(2);
            expect(value["results"]).lengthOf(2);
            expect(err).to.be.null;
            done();
        });
    });

    it("Envoi chaîne de caractère sur page - E", (done) => {
        WeatherService.findManyWeathers(null, "invalid", 2, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });
});

describe("findManyweathersById", () => {
    it("Chercher des weathers existants correct. - S", (done) => {
        WeatherService.findManyWeathersById(tab_id_weathers, null, function (err, value) {
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("updateOneWeather", () => {
    it("Modifier un Weather correct. - S", (done) => {
        WeatherService.updateOneWeather(
            id_weather_valid,
            { city: "Updated city", wind: "Updated wind" },
            function (err, value) {
                // console.log(value)
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("city");
                //  expect(value).to.haveOwnProperty("content");
                expect(value["city"]).to.be.equal("Updated city");
                expect(value["wind"]).to.be.equal("Updated wind");
                done();
            }
        );
    });

    it("Modifier un Weather avec id incorrect. - E", (done) => {
        WeatherService.updateOneWeather(
            "invalid_id",
            { city: "Updated city", wind: "Updated wind" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier un Weather avec des champs requis vides. - E", (done) => {
        WeatherService.updateOneWeather(
            id_weather_valid,
            { city: "", wind: "kdfjdl" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("city");
                done();
            }
        );
    });
});

describe("updateManyweathers", () => {
    it("Modifier plusieurs weathers correctement. - S", (done) => {
        WeatherService.updateManyWeathers(
            tab_id_weathers,
            { wind: "Bulk Updated wind" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.haveOwnProperty("modifiedCount");
                expect(value).to.haveOwnProperty("matchedCount");
                expect(value["matchedCount"]).to.be.equal(tab_id_weathers.length);
                expect(value["modifiedCount"]).to.be.equal(tab_id_weathers.length);
                done();
            }
        );
    });

    it("Modifier plusieurs weathers avec id incorrect. - E", (done) => {
        WeatherService.updateManyWeathers(
            ["invalid_id"],
            { temp: "Bulk Updated temp" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier plusieurs weathers avec des champs requis vides. - E", (done) => {
        WeatherService.updateManyWeathers(
            tab_id_weathers,
            { humidity: "", wind: "Bulk Updated wind" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("humidity");

                done();
            }
        );
    });
});

describe("deleteOneWeather", () => {
    it("Supprimer un Weather correct. - S", (done) => {
        WeatherService.deleteOneWeather(id_weather_valid, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("city");
            expect(value).to.haveOwnProperty("temp");
            done();
        });
    });

    it("Supprimer un Weather avec id incorrect. - E", (done) => {
        WeatherService.deleteOneWeather("invalid_id", function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer un Weather avec un id inexistant. - E", (done) => {
        WeatherService.deleteOneWeather(
            "665f18739d3e172be5daf092",
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-found");
                done();
            }
        );
    });
});

describe("deleteManyweathers", () => {
    it("Supprimer plusieurs weathers avec id incorrect. - E", (done) => {
        WeatherService.deleteManyWeathers(["invalid_id"], function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer plusieurs weathers correctement. - S", (done) => {
        WeatherService.deleteManyWeathers(tab_id_weathers, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("deletedCount");
            expect(value["deletedCount"]).is.equal(tab_id_weathers.length);
            done();
        });
    });


    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
});


