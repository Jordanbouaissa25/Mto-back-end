const UserService = require("../../services/UserService")
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');
const { destination } = require("pino");
var userConnect = {}
var weathers = [];
let token = ""

let user =
{
    firstName: "Détenteur du weather 1",
    lastName: "Iencli",
    username: "ouil",
    email: "iencli@gmail.com",
    password: "123456789"
}



chai.use(chaiHttp)

describe("Gestion api.", () => {
    it("Création d'utilisateur fictif", (done) => {
        UserService.addOneUser(user, null, function (err, value) {
            userConnect = { ...value }
            //  console.log(value)
            done()
        })
    })
})

// TEST CONTROLLER - Connecter un utilisateur (tous les roles)
describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        chai.request(server).post('/login').send({
            username: "iencli@gmail.com",
            password: "123456789"
        }).end((err, res) => {
            // console.log(err, res.body)
            res.should.have.status(200)
            token = res.body.token
            done()
        })
    })
})

describe("POST - /weather", () => {
    it("Ajouter un weather. - S", (done) => {
        chai.request(server).post('/weather').query({ city: "Besançon" }).auth(token, { type: "bearer" }).end((err, res) => {
            // console.log(err, res)
            expect(res).to.have.status(201);
            weathers.push(res.body);
            done();
        });
    });
    it("Ajouter un weather incorrect. (Sans humidity) - E", (done) => {
        chai.request(server).post('/weather').query({ city: "Besançon" }).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un weather incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/weather').query({ city: "" }).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("GET - /weather", () => {
    it("Chercher un weather valide. - S", (done) => {
        chai.request(server).get('/weather').query({ fields: ["humidity"], value: weathers[0].humidity }).auth(token, { type: "bearer" }).end((err, res) => {
            // console.log(err, res)
            res.should.have.status(200);
            done();
        });
    });
    it("Chercher un weather avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/weather').query({ fields: ["nonexistentField"], value: weathers[0].city }).auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un weather sans aucune query. - E", (done) => {
        chai.request(server).get('/weather').auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un weather inexistant. - E", (done) => {
        chai.request(server).get('/weather').query({ fields: ["city"], value: "Weather inexistant" }).auth(token, { type: "bearer" }).end((err, res) => {
            // console.log(res)
            res.should.have.status(404);
            done();
        });
    });
});

describe("GET - /weather/:id", () => {
    it("Chercher un weather valide. - S", (done) => {
        chai.request(server).get(`/weather/${weathers[0]._id}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id', weathers[0]._id);
            done();
        });
    });
    it("Chercher un weather non valide. - E", (done) => {
        const invalidweatherId = '123';
        chai.request(server).get(`/weather/${invalidweatherId}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Chercher un weather non trouvé. - E", (done) => {
        const nonExistentweatherId = '60d72b2f9b1d8b002f123456';
        chai.request(server).get(`/weather/${nonExistentweatherId}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("GET - /weathers", () => {
    it("Chercher plusieurs weathers valide. -S", (done) => {
        chai.request(server).get('/weathers_by_filters')
            .query({ q: "Invalid-id", page: 1, limit: 10 })
            .auth(token, { type: "bearer" }).end((err, res) => {
                // console.log(err, res)
                res.should.have.status(200)
                done();
            })
    })
    it("Chercher plusieurs weathers avec une query vide. -S", (done) => {
        chai.request(server).get('/weathers_by_filters')
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                // expect(res.body.count).to.be.equal(44)
                done()
            })
    })
    it("Chercher plusieurs weathers avec une chaîne de caractère dans page. -E", (done) => {
        chai.request(server).get('/weathers_by_filters').query({ page: 'une phrase', limit: 2 })
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("PUT - /weather/:id", () => {
    it("Modifier un weather valide. - S", (done) => {
        chai.request(server).put(`/weather/${weathers[0]._id}`).auth(token, { type: "bearer" }).send({
            city: "New city"
        }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Modifier un weather avec un id invalide. - E", (done) => {
        chai.request(server).put(`/weather/123456789`).auth(token, { type: "bearer" }).send({
            temp: 50
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Modifier un weather inexistant. - E", (done) => {
        chai.request(server).put(`/weather/60c72b2f4f1a4c3d88d9a1d9`).auth(token, { type: "bearer" }).send({
            wind: "Non inexistant"
        }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Modifier un weather avec un champ vide. - E", (done) => {
        chai.request(server).put(`/weather/${weathers[0]._id}`).auth(token, { type: "bearer" }).send({
            humidity: ""
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
});


describe("PUT - /weathers", () => {
    it("Modifier plusieurs weathers. - S", (done) => {
        chai.request(server).put('/weathers').query({ id: _.map(weathers, '_id') }).auth(token, { type: "bearer" }).send({
            temp: 30, wind: "km/h"
        })
            .end((err, res) => {
                // console.log(res)
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier plusieurs weathers avec ID ivalide. -E", (done) => {
        chai.request(server).put('/weathers').query({ id: ["1234", "616546"] }).auth(token, { type: "bearer" }).send({
            temp: 30
        }, {
            wind: "km/h"
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des weathers inexistants. -E", (done) => {
        chai.request(server).put('/weathers').auth(token, { type: "bearer" }).query({ id: ["6679773379a3a34adc0f05bf"] }).send({
            wind: "mi/h"
        })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier des weathers avec un champ vide. -E", (done) => {
        chai.request(server).put('/weathers').auth(token, { type: "bearer" }).query({ id: _.map(weathers, '_id') }).send({
            humidity: 50,
            wind: ""
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des weathers avec un id existant. -E", (done) => {
        chai.request(server).put('/weathers').auth(token, { type: "bearer" }).query({ _id: _.map(weathers, '_id') }).send({
            wind: "jskls"
        },
        )
            .end((err, res) => {
                // console.log(res.body)
                res.should.have.status(405)
                done()
            })
    })
})

describe("DELETE - /weather/:id", () => {
    it("Supprimer un weather valide. - S", (done) => {
        chai.request(server).delete(`/weather/${weathers[0]._id}`).auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Supprimer un weather avec un id inexistant. - E", (done) => {
        chai.request(server).delete(`/weather/60d72b2f9b1d8b002f123456`).auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it("Supprimer un weather avec un id invalide. - E", (done) => {
        chai.request(server).delete('/weather/123').auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});


describe("DELETE - /weathers", () => {
    it("Supprimer plusieurs weathers. - S", (done) => {
        chai.request(server).delete('/weathers').query({ id: _.map(weathers, '_id') })
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Supprimer plusieurs weathers incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/weathers/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer plusieurs weathers incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/weathers').query({ id: ['123', '456'] })
            .auth(token, { type: "bearer" }).end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })

    it("Supression des utilisateurs fictif", (done) => {
        UserService.deleteManyUsers(user, null, function (err, value) {
            done()
        })
    })
})
