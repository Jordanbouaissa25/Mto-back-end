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
        WeatherService.addOneWeather("Besançon", tab_id_users[0], null, function (err, value) {
            // console.log(value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_weather_valid = value._id;
            weathers.push(value);
            done()
        });
    });
    it("Weather incorrect. (Avec une city inexistante) - E", (done) => {
        WeatherService.addOneWeather("dflivjlfvjdl", tab_id_users[0], null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('no-found')
            done()
        });
    });
    it("Weather incorrect. (Ville déjà existante) - E", (done) => {
        WeatherService.addOneWeather("Besançon", tab_id_users[0], null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error')
            expect(err['type_error']).to.be.equal('duplicate')
            done();
        });
    });
});

describe("addManyWeathers", () => {
    const mockCities = ["Paris", "InvalidCity"]; // Example cities
    const user_id = tab_id_users[0]; // Mock user_id

    it("Ajouter des données météorologiques valides - S", (done) => {
        WeatherService.addManyWeathers(mockCities.slice(0, 1), user_id, {}, function (err, value) {
            if (err) {
                done(err); // Fail the test if an unexpected error occurs
            } else {
                tab_id_weathers = _.map(value, "_id");
                weathers = [...value, ...weathers];
                expect(value).to.be.an("array").that.has.lengthOf(1); // Adjust the expected length according to your mock data
                done();
            }
        });
    });

    it("Gérer correctement les données de ville non correct - E", (done) => {
        WeatherService.addManyWeathers(mockCities.slice(1), user_id, {}, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error');
            expect(err['type_error']).to.be.equal('multi');
            expect(err.errors).to.be.an("array").that.has.lengthOf(1);
            expect(err.errors[0]).to.haveOwnProperty('msg');
            expect(err.errors[0].type_error).to.be.oneOf(['no-found', 'no-valid']);
            done();
        });
    });

    it("Gérer les villes non valid - E", (done) => {
        WeatherService.addManyWeathers(mockCities, user_id, {}, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty('type_error');
            expect(err['type_error']).to.be.equal('multi');
            expect(err.errors).to.be.an("array").that.has.lengthOf(1); // Adjust based on mockCities
            done();
        });
    });
});


describe("findOneWeatherById", () => {
    it("Chercher un weather existant correct. - S", (done) => {
        WeatherService.findOneWeatherById(id_weather_valid, null, function (err, value) {
            console.log(err, value)
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("wind");
            expect(err).to.be.null; // Ensures no error is returned for a valid ID
            done();
        });
    });

    it("Chercher un Weather avec ObjectId non valide. - E", (done) => {
        WeatherService.findOneWeatherById("invalidObjectId", null, function (err, value) {
            // console.log(err, value)
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });

    it("Chercher un Weather non-existant correct. - E", (done) => {
        WeatherService.findOneWeatherById("64cbf7b3f392b6d70ec5b6f2", null, function (err, value) {
            // console.log(err, value)
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-found");
            done();
        });
    });
});


describe("findOneWeather", () => {
    it("Cherche un weather existant avec des champs valides. - S", (done) => {
        WeatherService.findOneWeather(["city"], "Paris", null, (err, value) => {
            expect(err).to.be.null;
            expect(value).to.be.an("object");
            expect(value).to.have.property("city", "Paris");
            expect(value).to.have.property("humidity");
            done();
        });
    });

    it("Cherche un weather avec des champs non autorisés. - E", (done) => {
        WeatherService.findOneWeather(["invalidField"], "Paris", null, (err, value) => {
            expect(err).to.have.property("msg")
            expect(err).to.have.property("type_error", "no-valid");
            done();
        });
    });

    it("Cherche un weather avec une valeur vide. - E", (done) => {
        WeatherService.findOneWeather(["city"], "", null, (err, value) => {
            expect(err).to.have.property("msg")
            expect(err).to.have.property("type_error", "no-valid");
            done();
        });
    });

    it("Cherche un weather avec des champs et valeurs valides mais inexistants. - E", (done) => {
        WeatherService.findOneWeather(["city"], "Inexistante", null, (err, value) => {
            expect(err).to.have.property("msg", "Weather non trouvé.");
            expect(err).to.have.property("type_error", "no-found");
            done();
        });
    });
})

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
})