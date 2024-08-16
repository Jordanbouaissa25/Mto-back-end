const ApiService = require("../../services/ApiService");
const UserService = require("../../services/UserService")
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var id_api_valid = "";
var tab_id_apis = [];
var apis = [];

var tab_id_users = []
let users = [
    {
        firstcity: "Détenteur du api 1",
        lastcity: "Iencli",
        usercity: "ouil",
        email: "iencli@gmail.com",
        password: "hello"
    },
    {
        firstcity: "Détenteur du api 2",
        lastcity: "Loup",
        usercity: "allo",
        email: "aryatte@gmail.com",
        password: "hello"
    },
    {
        firstcity: "Détenteur du api 3",
        lastcity: "mnm",
        usercity: "ayooooo",
        email: "tchao@gmail.com",
        password: "hello"
    },
    {
        firstcity: "Détenteur du api 4",
        lastcity: "djo",
        usercity: "edupont",
        email: "edupont@gmail.com",
        password: "hello"
    }
];

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}



describe("addOneApi", () => {
    it("Création des utilisateurs fictif", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            tab_id_users = _.map(value, "_id")
            done()
        })
    })
    it("Api correct. - S", (done) => {
        var api = {
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 20,
            last_fetched: 20 / 10 / 2020,
            user_id: rdm_user(tab_id_users)
        };
        ApiService.addOneApi(api, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_api_valid = value._id;
            apis.push(value);
            done()
        });
    });

    it("Api incorrect. (Sans endpoint_url) - E", () => {
        var api_no_valid = {
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            rate_limit: 20,
            last_fetched: 20 / 10 / 2020,
            user_id: rdm_user(tab_id_users)
        };
        ApiService.addOneApi(api_no_valid, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
            expect(err).to.haveOwnProperty("fields");
            expect(err["fields"]).to.haveOwnProperty("endpoint_url");
            expect(err["fields"]["endpoint_url"]).to.equal(
                "Path `endpoint_url` is required."
            );
        });
    });
});

describe("addManyApis", () => {
    it("apis à ajouter, non valide. - E", (done) => {
        var apis_tab_error = [
            {
                api_name: "Weatfks,fApi",
                api_key: "6a8832a265lsdmsf679d0530d8309fb51c880",
                endpoint_url: "https://api.openweatopmclchermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
                rate_limit: 20,
                last_fetched: 20 / 10 / 2020,
                user_id: rdm_user(tab_id_users)
            },
            {
                api_name: "Weathefspdnfkspi",
                api_key: "6a8832a265cswokkfpf679d0530d8309fb51c880",
                endpoint_url: "https://api.opencswklfjlsweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
                rate_limit: 20,
                last_fetched: 20 / 10 / 2020,
                user_id: rdm_user(tab_id_users)
            },
        ];

        ApiService.addManyApis(apis_tab_error, function (err, value) {
            done();
        });
    });

    it("Apis à ajouter, valide. - S", (done) => {
        var apis_tab = [
            {
                api_name: "Weather Api",
                api_key: "6a8832a265f679d0530d8309fb51c880",
                endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
                rate_limit: 40,
                last_fetched: 20 / 10 / 2022,
                user_id: rdm_user(tab_id_users)
            },
            {
                api_name: "Weather Api",
                api_key: "6a8832a265f679d0530d8309fb51c880",
                endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
                rate_limit: 205,
                last_fetched: 20 / 10 / 2029,
                user_id: rdm_user(tab_id_users)
            },
        ];

        ApiService.addManyApis(apis_tab, function (err, value) {
            tab_id_apis = _.map(value, "_id");
            apis = [...value, ...apis];
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("findOneApi", () => {
    it("Chercher un Api par les champs sélectionné. - S", (done) => {
        ApiService.findOneApi(["api_name"], apis[0].api_name, null, function (err, value) {
            console.log(apis[0])
            console.log(err, value)
            expect(value).to.haveOwnProperty('api_name');
            done();
        });
    });

    it("Chercher un Api avec un champ non autorisé. - E", (done) => {
        ApiService.findOneApi(["api_name", "api_key"], apis[0].last_fetched, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un Api sans tableau de champ. - E", (done) => {
        ApiService.findOneApi("rate_limit", apis[0].rate_limit, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un Api inexistant. - E", (done) => {
        ApiService.findOneApi(["rate_limit"], "non-existent-rate_limit", null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });
});

describe("findOneApiById", () => {
    it("Chercher un api existant correct. - S", (done) => {
        ApiService.findOneApiById(id_api_valid, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("api_key");
            done();
        });
    });


    it("Chercher un Api non-existant correct. - E", (done) => {
        ApiService.findOneApiById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            done();
        });
    });
});

describe("findManyapis", () => {
    it("Retourne 2 apis. - S", (done) => {
        ApiService.findManyApis(null, 1, 2, null, function (err, value) {
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
        ApiService.findManyApis(null, "invalid", 2, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });
});

describe("findManyapisById", () => {
    it("Chercher des apis existants correct. - S", (done) => {
        ApiService.findManyApisById(tab_id_apis, null, function (err, value) {
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("updateOneApi", () => {
    it("Modifier un Api correct. - S", (done) => {
        ApiService.updateOneApi(
            id_api_valid,
            { api_name: "Updated api_name", api_key: "Updated api_key" },
            function (err, value) {
                // console.log(err)
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("api_key");
                //  expect(value).to.haveOwnProperty("content");
                expect(value["api_key"]).to.be.equal("Updated api_key");
                expect(value["api_name"]).to.be.equal("Updated api_name");
                done();
            }
        );
    });

    it("Modifier un Api avec id incorrect. - E", (done) => {
        ApiService.updateOneApi(
            "invalid_id",
            { api_name: "Updated api_name", api_key: "Updated api_key" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier un Api avec des champs requis vides. - E", (done) => {
        ApiService.updateOneApi(
            id_api_valid,
            { api_name: "", api_key: "Updated api_key" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("api_name");

                done();
            }
        );
    });
});

describe("updateManyApis", () => {
    it("Modifier plusieurs apis correctement. - S", (done) => {
        ApiService.updateManyApis(
            tab_id_apis,
            { api_name: "Bulk Updated api_name" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.haveOwnProperty("modifiedCount");
                expect(value).to.haveOwnProperty("matchedCount");
                expect(value["matchedCount"]).to.be.equal(tab_id_apis.length);
                expect(value["modifiedCount"]).to.be.equal(tab_id_apis.length);
                done();
            }
        );
    });

    it("Modifier plusieurs apis avec id incorrect. - E", (done) => {
        ApiService.updateManyApis(
            ["invalid_id"],
            { api_name: "Bulk Updated api_name" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier plusieurs apis avec des champs requis vides. - E", (done) => {
        ApiService.updateManyApis(
            tab_id_apis,
            { api_key: "", api_name: "Bulk Updated api_name" },
            function (err, value) {
                // console.log(err, value)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("api_key");

                done();
            }
        );
    });
});

describe("deleteOneApi", () => {
    it("Supprimer un Api correct. - S", (done) => {
        ApiService.deleteOneApi(id_api_valid, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("api_name");
            expect(value).to.haveOwnProperty("api_key");
            done();
        });
    });

    it("Supprimer un Api avec id incorrect. - E", (done) => {
        ApiService.deleteOneApi("invalid_id", function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer un Api avec un id inexistant. - E", (done) => {
        ApiService.deleteOneApi(
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

describe("deleteManyapis", () => {
    it("Supprimer plusieurs apis avec id incorrect. - E", (done) => {
        ApiService.deleteManyApis(["invalid_id"], function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer plusieurs apis correctement. - S", (done) => {
        ApiService.deleteManyApis(tab_id_apis, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("deletedCount");
            expect(value["deletedCount"]).is.equal(tab_id_apis.length);
            done();
        });
    });


    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
});


