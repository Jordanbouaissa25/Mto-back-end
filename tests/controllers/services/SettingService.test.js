const SettingService = require("../../services/SettingService");
const UserService = require("../../services/UserService")
const chai = require("chai");
let expect = chai.expect;
const _ = require("lodash");
var id_setting_valid = "";
var tab_id_settings = [];
var settings = [];

var tab_id_users = []
let users = [
    {
        firstName: "Détenteur du setting 1",
        lastName: "Iencli",
        username: "ouil",
        email: "iencli@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du setting 2",
        lastName: "Loup",
        username: "allo",
        email: "aryatte@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du setting 3",
        lastName: "mnm",
        username: "ayooooo",
        email: "tchao@gmail.com",
        password: "hello"
    },
    {
        firstName: "Détenteur du setting 4",
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



describe("addOneSetting", () => {
    it("Création des utilisateurs fictif", (done) => {
        UserService.addManyUsers(users, null, function (err, value) {
            tab_id_users = _.map(value, "_id")
            done()
        })
    })
    it("Setting correct. - S", (done) => {
        var setting = {
            price: 15,
            quantity: 25,
            description: "Setting sur Montbéliard",
            name: "John lacours",
            user_id: rdm_user(tab_id_users)
        };
        SettingService.addOneSetting(setting, null, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            id_setting_valid = value._id;
            settings.push(value);
            done()
        });
    });

    it("Setting incorrect. (Sans name) - E", () => {
        var setting_no_valid = {
            price: "152165 euros",
            quantity: "25495",
            description: "Setting sur Monlksckstbéliard",
            user_id: rdm_user(tab_id_users)
        };
        SettingService.addOneSetting(setting_no_valid, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
            expect(err).to.haveOwnProperty("fields");
            expect(err["fields"]).to.haveOwnProperty("name");
            expect(err["fields"]["name"]).to.equal(
                "Path `name` is required."
            );
        });
    });
});

describe("addManySettings", () => {
    it("Settings à ajouter, non valide. - E", (done) => {
        var settings_tab_error = [
            {
                price: 1465,
                quantity: 265,
                description: "Artisklhsk sur dsqkjd",
                name: "John laslkjscours",
                user_id: rdm_user(tab_id_users)
            },
            {
                price: 14665445,
                quantity: 246465,
                description: "Artisklhsk sursdopkspd dsqkjd",
                name: "Johnoàeofpee laslkjscours",
                user_id: rdm_user(tab_id_users)
            },
        ];

        SettingService.addManySettings(settings_tab_error, function (err, value) {
            done();
        });
    });

    it("Settings à ajouter, valide. - S", (done) => {
        var settings_tab = [
            {
                price: 15,
                quantity: 25,
                description: "Setting sur Paris",
                name: "John lacours",
                user_id: rdm_user(tab_id_users)
            },
            {
                price: 50,
                quantity: 35,
                description: "Setting sur Paris",
                name: "Djo La Douille",
                user_id: rdm_user(tab_id_users)
            },
        ];

        SettingService.addManySettings(settings_tab, function (err, value) {
            tab_id_settings = _.map(value, "_id");
            settings = [...value, ...settings];
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("findOneSetting", () => {
    it("Chercher un setting par les champs sélectionné. - S", (done) => {
        SettingService.findOneSetting(["name"], settings[0].name, null, function (err, value) {
            expect(value).to.haveOwnProperty('name');
            done();
        });
    });

    it("Chercher un setting avec un champ non autorisé. - E", (done) => {
        SettingService.findOneSetting(["setting_temperature", "setting_wind"], settings[0].description, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un setting sans tableau de champ. - E", (done) => {
        SettingService.findOneSetting("name", settings[0].name, null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });

    it("Chercher un setting inexistant. - E", (done) => {
        SettingService.findOneSetting(["name"], "non-existent-name", null, function (err, value) {
            expect(err).to.haveOwnProperty('type_error');
            done();
        });
    });
});

describe("findOneSettingById", () => {
    it("Chercher un setting existant correct. - S", (done) => {
        // console.log('id_setting_valid:', id_setting_valid); // Add this line for debugging
        SettingService.findOneSettingById(id_setting_valid, null, function (err, value) {
            //   console.log('Error:', err); // Log the error
            //   console.log('Value:', value); // Log the value
            if (err) {
                return done(err);
            }
            if (!value) {
                return done(new Error("Value is null or undefined"));
            }
            try {
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("name");
                done();
            } catch (e) {
                done(e);
            }
        });
    });


    it("Chercher un setting non-existant correct. - E", (done) => {
        SettingService.findOneSettingById("100", null, function (err, value) {
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.equal("no-valid");
            done();
        });
    });
});

describe("findManySettings", () => {
    it("Retourne 2 settings. - S", (done) => {
        SettingService.findManySettings(null, 1, 2, null, function (err, value) {
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
        SettingService.findManySettings(null, "invalid", 2, null, function (err, value) {
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            expect(value).to.be.undefined;
            done();
        });
    });
});

describe("findManySettingsById", () => {
    it("Chercher des settings existants correct. - S", (done) => {
        SettingService.findManySettingsById(tab_id_settings, null, function (err, value) {
            expect(value).lengthOf(2);
            done();
        });
    });
});

describe("updateOneSetting", () => {
    it("Modifier un setting correct. - S", (done) => {
        SettingService.updateOneSetting(
            id_setting_valid,
            { name: "Updated name", description: "Updated description" },
            function (err, value) {
                expect(value).to.be.a("object");
                expect(value).to.haveOwnProperty("_id");
                expect(value).to.haveOwnProperty("name");
                //  expect(value).to.haveOwnProperty("content");
                expect(value["name"]).to.be.equal("Updated name");
                expect(value["description"]).to.be.equal("Updated description");
                done();
            }
        );
    });

    it("Modifier un setting avec id incorrect. - E", (done) => {
        SettingService.updateOneSetting(
            "invalid_id",
            { name: "Updated name", description: "Updated description" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier un setting avec des champs requis vides. - E", (done) => {
        SettingService.updateOneSetting(
            id_setting_valid,
            { name: "", description: "Updated description" },
            function (err, value) {
                // expect(value).to.be.undefined;
                //  console.log(err)
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("name");

                done();
            }
        );
    });
});

describe("updateManySettings", () => {
    it("Modifier plusieurs settings correctement. - S", (done) => {
        SettingService.updateManySettings(
            tab_id_settings,
            { description: "Bulk Updated description" },
            function (err, value) {
                //  console.log(value)
                expect(value).to.haveOwnProperty("modifiedCount");
                expect(value).to.haveOwnProperty("matchedCount");
                expect(value["matchedCount"]).to.be.equal(tab_id_settings.length);
                expect(value["modifiedCount"]).to.be.equal(tab_id_settings.length);
                done();
            }
        );
    });

    it("Modifier plusieurs settings avec id incorrect. - E", (done) => {
        SettingService.updateManySettings(
            ["invalid_id"],
            { description: "Bulk Updated description" },
            function (err, value) {
                expect(err).to.be.a("object");
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("type_error");
                expect(err["type_error"]).to.be.equal("no-valid");
                done();
            }
        );
    });

    it("Modifier plusieurs settings avec des champs requis vides. - E", (done) => {
        SettingService.updateManySettings(
            tab_id_settings,
            { name: "", description: "Bulk Updated description" },
            function (err, value) {
                //  console.log(err)
                expect(value).to.be.undefined;
                expect(err).to.haveOwnProperty("msg");
                expect(err).to.haveOwnProperty("fields_with_error").with.lengthOf(1);
                expect(err).to.haveOwnProperty("fields");
                expect(err["fields"]).to.haveOwnProperty("name");

                done();
            }
        );
    });
});

describe("deleteOneSetting", () => {
    it("Supprimer un setting correct. - S", (done) => {
        SettingService.deleteOneSetting(id_setting_valid, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("_id");
            expect(value).to.haveOwnProperty("name");
            expect(value).to.haveOwnProperty("description");
            done();
        });
    });

    it("Supprimer un setting avec id incorrect. - E", (done) => {
        SettingService.deleteOneSetting("invalid_id", function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer un setting avec un id inexistant. - E", (done) => {
        SettingService.deleteOneSetting(
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

describe("deleteManySettings", () => {
    it("Supprimer plusieurs settings avec id incorrect. - E", (done) => {
        SettingService.deleteManySettings(["invalid_id"], function (err, value) {
            expect(err).to.be.a("object");
            expect(err).to.haveOwnProperty("msg");
            expect(err).to.haveOwnProperty("type_error");
            expect(err["type_error"]).to.be.equal("no-valid");
            done();
        });
    });

    it("Supprimer plusieurs settings correctement. - S", (done) => {
        SettingService.deleteManySettings(tab_id_settings, function (err, value) {
            expect(value).to.be.a("object");
            expect(value).to.haveOwnProperty("deletedCount");
            expect(value["deletedCount"]).is.equal(tab_id_settings.length);
            done();
        });
    });


    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
});


