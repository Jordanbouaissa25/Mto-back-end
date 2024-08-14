const UserService = require("../../services/UserService")
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');
const { destination } = require("pino");
var tab_id_users = []
var weathers = [];
let token = ""

let users = [
    {
        firstName: "Détenteur du weather 1",
        lastName: "Iencli",
        username: "ouil",
        email: "iencli@gmail.com",
        password: "123456789"
    },
    {
        firstName: "Détenteur du weather 2",
        lastName: "Loup",
        username: "allo",
        email: "aryatte@gmail.com",
        password: "12345"
    },
    {
        firstName: "Détenteur du weather 3",
        lastName: "mnm",
        username: "ayooooo",
        email: "tchao@gmail.com",
        password: "0000"
    },
    {
        firstName: "Détenteur du weather 4",
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

describe("POST - /weather", () => {
    it("Ajouter un weather. - S", (done) => {
        var e = {
            wind: "km/h",
            temp: "°C",
            city: "Montbéliard",
            humidity: "50%",
            user_id: rdm_user(tab_id_users)
        }
        chai.request(server).post('/weather').send(e).end((err, res) => {
            expect(res).to.have.status(201);
            weathers.push(res.body);
            done();
        });
    });
    it("Ajouter un weather incorrect. (Sans humidity) - E", (done) => {
        chai.request(server).post('/weather').send({
            wind: "km/p",
            temp: "°D",
            city: "snfhs",
            user_id: rdm_user(tab_id_users)
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})
it("Ajouter un weather incorrect. (Avec un champ vide) - E", (done) => {
    chai.request(server).post('/weather').send({
        wind: "km/p",
        temp: "",
    }).end((err, res) => {
        expect(res).to.have.status(405)
        done()
    })
})

describe("POST - /weathers", () => {
    it("Ajouter des weathers. -S", (done) => {
        chai.request(server).post('/weathers').send([{
            wind: "km/h",
            temp: "°C",
            city: "Phuket",
            humidity: "75%",
            user_id: rdm_user(tab_id_users)
        },
        {
            wind: "mi/h",
            temp: "°F",
            city: "Brisbane",
            humidity: "45%",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            // console.log(res)
            weathers = [...weathers, ...res.body]
            expect(res).to.have.status(201)
            done()
        });
    })

    it("Ajouter des weathers incorrect. (Sans wind) - E", (done) => {
        chai.request(server).post('/weathers').send([{
            temp: "°P",
            city: "djsoid",
            humidity: "sijoos"
        },
        {
            temp: "°C",
            city: "Londres",
            humidity: "15%"
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des weathers incorrect. (sans temp) - E", (done) => {
        chai.request(server).post('/weathers').send([{
            weather_wind: "kmpp/h",
            humidity: "oisjcos",
            user_id: rdm_user(tab_id_users)
        },
        {
            wind: "kmijd/h",
            humidity: "sijds",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des weathers incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/weathers').send([{
            wind: "km/p",
            temp: "ksdl",
            city: "",
            humidity: "",
            user_id: rdm_user(tab_id_users)
        }, {
            wind: "",
            temp: "ksdl",
            city: "",
            humidity: "20%",
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("GET - /weather", () => {
    it("Chercher un weather valide. - S", (done) => {
        chai.request(server).get('/weather').query({ fields: ["temp"], value: weathers[0].temp }).end((err, res) => {
            // console.log(err, res)
            res.should.have.status(200);
            done();
        });
    });
    it("Chercher un weather avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/weather').query({ fields: ["nonexistentField"], value: weathers[0].city }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un weather sans aucune query. - E", (done) => {
        chai.request(server).get('/weather').end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un weather inexistant. - E", (done) => {
        chai.request(server).get('/weather').query({ fields: ["wind"], value: "Setting inexistant" }).end((err, res) => {
            // console.log(res)
            res.should.have.status(404);
            done();
        });
    });
});

describe("GET - /weather/:id", () => {
    it("Chercher un weather valide. - S", (done) => {
        chai.request(server).get(`/weather/${weathers[0]._id}`).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id', weathers[0]._id);
            done();
        });
    });
    it("Chercher un weather non valide. - E", (done) => {
        const invalidweatherId = '123';
        chai.request(server).get(`/weather/${invalidweatherId}`).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Chercher un weather non trouvé. - E", (done) => {
        const nonExistentweatherId = '60d72b2f9b1d8b002f123456';
        chai.request(server).get(`/weather/${nonExistentweatherId}`).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("GET - /weathers", () => {
    it("Chercher plusieurs weathers valide. -S", (done) => {
        chai.request(server).get('/weathers').query({ id: _.map(weathers, "_id") }).end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher plusieurs weathers avec un id invalide. -E", (done) => {
        chai.request(server).get('/weathers').query({ id: ["123456789", "123598745"] })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Chercher plusieurs weathers avec un id valide mais inexistant. -E", (done) => {
        chai.request(server).get('/weathers').query({ id: ["6679389b79a3a34adc0ef201", "6679388f79a3a34adc0ef200"] })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})


describe("GET - /weathers", () => {
    it("Chercher plusieurs weathers valide. -S", (done) => {
        chai.request(server).get('/weathers_by_filters').query({ page: 1, limit: 2 }).end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Chercher plusieurs weathers avec une query vide. -S", (done) => {
        chai.request(server).get('/weathers_by_filters')
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                // expect(res.body.count).to.be.equal(44)
                done()
            })
    })
    it("Chercher plusieurs weathers avec une chaîne de caractère dans page. -E", (done) => {
        chai.request(server).get('/weathers_by_filters').query({ page: 'une phrase', limit: 2 })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})


describe("PUT - /weather/:id", () => {
    it("Modifier un weather valide. - S", (done) => {
        chai.request(server).put(`/weather/${weathers[0]._id}`).send({
            city: "New city"
        }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Modifier un weather avec un id invalide. - E", (done) => {
        chai.request(server).put(`/weather/123456789`).send({
            price: 50
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Modifier un weather inexistant. - E", (done) => {
        chai.request(server).put(`/weather/60c72b2f4f1a4c3d88d9a1d9`).send({
            temp: "Non inexistant"
        }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Modifier un weather avec un champ vide. - E", (done) => {
        chai.request(server).put(`/weather/${weathers[0]._id}`).send({
            humidity: ""
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
});


describe("PUT - /weathers", () => {
    it("Modifier plusieurs weathers. - S", (done) => {
        chai.request(server).put('/weathers').query({ id: _.map(weathers, '_id') }).send({
            temp: "°C", wind: "km/h"
        })
            .end((err, res) => {
                // console.log(res)
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier plusieurs weathers avec ID ivalide. -E", (done) => {
        chai.request(server).put('/weathers').query({ id: ["1234", "616546"] }).send({
            temp: "°C"
        }, {
            wind: "km/h"
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des weathers inexistants. -E", (done) => {
        chai.request(server).put('/weathers').query({ id: ["6679773379a3a34adc0f05bf"] }).send({
            wind: "°ppp"
        })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier des weathers avec un champ vide. -E", (done) => {
        chai.request(server).put('/weathers').query({ id: _.map(weathers, '_id') }).send({
            humidity: "50°",
            wind: ""
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des weathers avec un id existant. -E", (done) => {
        chai.request(server).put('/weathers').query({ _id: _.map(weathers, '_id') }).send({
            wind: weathers[1].wind
        },
        )
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("DELETE - /weather/:id", () => {
    it("Supprimer un weather valide. - S", (done) => {
        chai.request(server).delete(`/weather/${weathers[0]._id}`).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Supprimer un weather avec un id inexistant. - E", (done) => {
        chai.request(server).delete(`/weather/60d72b2f9b1d8b002f123456`).end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it("Supprimer un weather avec un id invalide. - E", (done) => {
        chai.request(server).delete('/weather/123').end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});


describe("DELETE - /weathers", () => {
    it("Supprimer plusieurs weathers. - S", (done) => {
        chai.request(server).delete('/weathers').query({ id: _.map(weathers, '_id') })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Supprimer plusieurs weathers incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/weathers/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer plusieurs weathers incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/weathers').query({ id: ['123', '456'] })
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
