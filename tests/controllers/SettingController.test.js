const UserService = require("../../services/UserService")
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');
const { destination } = require("pino");
var tab_id_users = []
var settings = [];
let token = ""

let users = [
    {
        firstName: "Détenteur du setting 1",
        lastName: "Iencli",
        username: "ouil",
        email: "iencli@gmail.com",
        password: "123456789"
    },
    {
        firstName: "Détenteur du setting 2",
        lastName: "Loup",
        username: "allo",
        email: "aryatte@gmail.com",
        password: "12345"
    },
    {
        firstName: "Détenteur du setting 3",
        lastName: "mnm",
        username: "ayooooo",
        email: "tchao@gmail.com",
        password: "0000"
    },
    {
        firstName: "Détenteur du setting 4",
        lastName: "djo",
        username: "feefe",
        email: "dffefzf@gmail.com",
        password: "0123"
    }
];

it("Création des utilisateurs fictif", (done) => {
    UserService.addManyUsers(users, null, function (err, value) {
        tab_id_users = _.map(value, "_id")
        done()
    })
})

function rdm_user(tab) {
    let rdm_id = tab[Math.floor(Math.random() * (tab.length - 1))]
    return rdm_id
}

chai.use(chaiHttp)

describe("POST - /setting", () => {
    it("Ajouter un setting. - S", (done) => {
        var e = {
            setting_wind: "km/h",
            setting_temperature: "°C",
            update_email: "jordanbouaissa25@gmail.com",
            update_password: "0000",
            user_id: rdm_user(tab_id_users)
        }
        chai.request(server).post('/setting').send(e).end((err, res) => {
            expect(res).to.have.status(201);
            settings.push(res.body);
            done();
        });
    });
    it("Ajouter un setting incorrect. (Sans update_password) - E", (done) => {
        chai.request(server).post('/setting').send({
            setting_wind: "km/p",
            setting_temperature: "°D",
            update_email: "sjknfk@gmail.com",
            user_id: rdm_user(tab_id_users)
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})
it("Ajouter un setting incorrect. (Avec un champ vide) - E", (done) => {
    chai.request(server).post('/setting').send({
        setting_wind: "km/p",
        setting_temperature: "",
        update_email: "sdlsqfjsq@gmail.com"
    }).end((err, res) => {
        expect(res).to.have.status(405)
        done()
    })
})

describe("POST - /settings", () => {
    it("Ajouter des settings. -S", (done) => {
        chai.request(server).post('/settings').send([{
            setting_wind: "km/h",
            setting_temperature: "°C",
            update_email: "edupont@gmail.com",
            update_password: "0000",
            user_id: rdm_user(tab_id_users)
        },
        {
            setting_wind: "vm/h",
            setting_temperature: "°F",
            update_email: "lucasverlin@gmail.com",
            update_password: "0023500",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            settings = [...settings, ...res.body]
            expect(res).to.have.status(201)
            done()
        });
    })

    it("Ajouter des settings incorrect. (Sans setting_wind) - E", (done) => {
        chai.request(server).post('/settings').send([{
            setting_temperature: "°P",
            update_email: "jordanbouaissacsok25gmail.com",
            update_password: "000520",
        },
        {
            setting_temperature: "°C",
            update_email: "jordanbouaissa9025gmail.com",
            update_password: "1234",
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des settings incorrect. (sans setting_temperature) - E", (done) => {
        chai.request(server).post('/settings').send([{
            setting_wind: "kmpp/h",
            update_email: "jordanradio25gmail.com",
            update_password: "0000",
            user_id: rdm_user(tab_id_users)
        },
        {
            setting_wind: "kmijd/h",
            update_email: "jordanbouagmail.com",
            update_password: "5999",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des settings incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/settings').send([{
            setting_wind: "km/p",
            setting_temperature: "ksdl",
            update_email: "",
            update_password: "0000",
            user_id: rdm_user(tab_id_users)
        }, {
            setting_wind: "kmdsklf/h",
            setting_temperature: "°dslC",
            update_email: "",
            update_password: "0000",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("GET - /setting", () => {
    it("Chercher un setting valide. - S", (done) => {
        chai.request(server).get('/setting').query({ fields: ["update_email"], value: settings[0].update_email }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Chercher un setting avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/setting').query({ fields: ["nonexistentField"], value: settings[0].update_email }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un setting sans aucune query. - E", (done) => {
        chai.request(server).get('/setting').end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un setting inexistant. - E", (done) => {
        chai.request(server).get('/setting').query({ fields: ["update_email"], value: "TitreInexistant" }).end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
});

describe("GET - /setting/:id", () => {
    it("Chercher un setting valide. - S", (done) => {
        chai.request(server).get(`/setting/${settings[0]._id}`).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id', settings[0]._id);
            done();
        });
    });
    it("Chercher un setting non valide. - E", (done) => {
        const invalidsettingId = '123';
        chai.request(server).get(`/setting/${invalidsettingId}`).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Chercher un setting non trouvé. - E", (done) => {
        const nonExistentsettingId = '60d72b2f9b1d8b002f123456';
        chai.request(server).get(`/setting/${nonExistentsettingId}`).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("GET - /settings", () => {
    it("Chercher plusieurs settings valide. -S", (done) => {
        chai.request(server).get('/settings').query({ id: _.map(settings, "_id") }).end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher plusieurs settings avec un id invalide. -E", (done) => {
        chai.request(server).get('/settings').query({ id: ["123456789", "123598745"] })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Chercher plusieurs settings avec un id valide mais inexistant. -E", (done) => {
        chai.request(server).get('/settings').query({ id: ["6679389b79a3a34adc0ef201", "6679388f79a3a34adc0ef200"] })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})


describe("GET - /settings", () => {
    it("Chercher plusieurs settings valide. -S", (done) => {
        chai.request(server).get('/settings_by_filters').query({ page: 1, limit: 2 }).end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Chercher plusieurs settings avec une query vide. -S", (done) => {
        chai.request(server).get('/settings_by_filters')
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                // expect(res.body.count).to.be.equal(44)
                done()
            })
    })
    it("Chercher plusieurs settings avec une chaîne de caractère dans page. -E", (done) => {
        chai.request(server).get('/settings_by_filters').query({ page: 'une phrase', limit: 2 })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})


describe("PUT - /setting/:id", () => {
    it("Modifier un setting valide. - S", (done) => {
        chai.request(server).put(`/setting/${settings[0]._id}`).send({
            description: "New description"
        }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Modifier un setting avec un id invalide. - E", (done) => {
        chai.request(server).put(`/setting/123456789`).send({
            price: 50
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Modifier un setting inexistant. - E", (done) => {
        chai.request(server).put(`/setting/60c72b2f4f1a4c3d88d9a1d9`).send({
            name: "Non inexistant"
        }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Modifier un setting avec un champ vide. - E", (done) => {
        chai.request(server).put(`/setting/${settings[0]._id}`).send({
            name: ""
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
});


describe("PUT - /settings", () => {
    it("Modifier plusieurs settings. - S", (done) => {
        chai.request(server).put('/settings').query({ id: _.map(settings, '_id') }).send({
            update_email: "bonjourlavie@gmail.com"
        },
            {
                update_email: "aurevoirlavie@gmail.com"
            })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier plusieurs settings avec ID ivalide. -E", (done) => {
        chai.request(server).put('/settings').query({ id: ["1234", "616546"] }).send({
            update_email: "jordanmonroule@gmail.com"
        }, {
            update_email: "Parisiendu75@gmail.com"
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des settings inexistants. -E", (done) => {
        chai.request(server).put('/settings').query({ id: ["6679773379a3a34adc0f05bf"] }).send({
            setting_temperature: "°ppp"
        }, {
            update_email: "nsfksjks"
        })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier des settings avec un champ vide. -E", (done) => {
        chai.request(server).put('/settings').query({ id: _.map(settings, '_id') }).send({
            update_email: "JohnLacours@gmail.com",
            update_password: ""
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des settings avec un id existant. -E", (done) => {
        chai.request(server).put('/settings').query({ _id: _.map(settings, '_id') }).send({
            update_email: settings[1].update_email
        },
        )
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("DELETE - /setting/:id", () => {
    it("Supprimer un setting valide. - S", (done) => {
        chai.request(server).delete(`/setting/${settings[0]._id}`).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Supprimer un setting avec un id inexistant. - E", (done) => {
        chai.request(server).delete(`/setting/60d72b2f9b1d8b002f123456`).end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it("Supprimer un setting avec un id invalide. - E", (done) => {
        chai.request(server).delete('/setting/123').end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});


describe("DELETE - /settings", () => {
    it("Supprimer plusieurs settings. - S", (done) => {
        chai.request(server).delete('/settings').query({ id: _.map(settings, '_id') })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Supprimer plusieurs settings incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/settings/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer plusieurs settings incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/settings').query({ id: ['123', '456'] })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })

    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(tab_id_users, null, function (err, value) {
            done()
        })
    })
})
