const UserService = require("../../services/UserService")
const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server');
let should = chai.should();
const _ = require('lodash');
const { destination } = require("pino");
var tab_id_users = []
var apis = [];
let token = ""

let users = [
    {
        firstName: "Détenteur du api 1",
        lastName: "Iencli",
        username: "ouil",
        email: "iencli@gmail.com",
        password: "123456789"
    },
    {
        firstName: "Détenteur du api 2",
        lastName: "Loup",
        username: "allo",
        email: "aryatte@gmail.com",
        password: "12345"
    },
    {
        firstName: "Détenteur du api 3",
        lastName: "mnm",
        username: "ayooooo",
        email: "tchao@gmail.com",
        password: "0000"
    },
    {
        firstName: "Détenteur du api 4",
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

describe("POST - /api", () => {
    it("Ajouter un api. - S", (done) => {
        var e = {
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2022,
            user_id: rdm_user(tab_id_users)
        }
        chai.request(server).post('/api').send(e).end((err, res) => {
            expect(res).to.have.status(201);
            apis.push(res.body);
            done();
        });
    });
    it("Ajouter un api incorrect. (Sans api_name) - E", (done) => {
        chai.request(server).post('/api').send({
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2022,
            user_id: rdm_user(tab_id_users)
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})
it("Ajouter un api incorrect. (Avec un champ vide) - E", (done) => {
    chai.request(server).post('/api').send({
        api_name: "Weather Api",
        api_key: "",
        endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
        rate_limit: 40,
        last_fetched: 20 / 10 / 2022,
    }).end((err, res) => {
        expect(res).to.have.status(405)
        done()
    })
})

describe("POST - /apis", () => {
    it("Ajouter des apis. -S", (done) => {
        chai.request(server).post('/apis').send([{
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2028,
            user_id: rdm_user(tab_id_users)
        },
        {
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2042,
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            // console.log(res)
            apis = [...apis, ...res.body]
            expect(res).to.have.status(201)
            done()
        });
    })

    it("Ajouter des apis incorrect. (Sans api_key) - E", (done) => {
        chai.request(server).post('/apis').send([{
            api_name: "Weather Api",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2022,
        },
        {
            api_name: "Weather Api",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2028,
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des apis incorrect. (sans endpoint_url) - E", (done) => {
        chai.request(server).post('/apis').send([{
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2022,
            user_id: rdm_user(tab_id_users)
        },
        {
            api_name: "Weather Api",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            rate_limit: 408,
            last_fetched: 20 / 10 / 2022,
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des apis incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/apis').send([{
            api_name: "",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2022,
            user_id: rdm_user(tab_id_users)
        }, {
            api_name: "",
            api_key: "6a8832a265f679d0530d8309fb51c880",
            endpoint_url: "https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}",
            rate_limit: 40,
            last_fetched: 20 / 10 / 2022,
            user_id: rdm_user(tab_id_users)
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("GET - /api", () => {
    it("Chercher un api valide. - S", (done) => {
        chai.request(server).get('/api').query({ fields: ["api_name"], value: apis[0].api_name }).end((err, res) => {
            // console.log(err, res)
            res.should.have.status(200);
            done();
        });
    });
    it("Chercher un api avec un champ non autorisé. - E", (done) => {
        chai.request(server).get('/api').query({ fields: ["nonexistentField"], value: apis[0].api_key }).end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un api sans aucune query. - E", (done) => {
        chai.request(server).get('/api').end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
    it("Chercher un api inexistant. - E", (done) => {
        chai.request(server).get('/api').query({ fields: ["api_key"], value: "Api inexistant" }).end((err, res) => {
            // console.log(res)
            res.should.have.status(404);
            done();
        });
    });
});

describe("GET - /api/:id", () => {
    it("Chercher un api valide. - S", (done) => {
        chai.request(server).get(`/api/${apis[0]._id}`).end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.property('_id', apis[0]._id);
            done();
        });
    });
    it("Chercher un api non valide. - E", (done) => {
        const invalidapiId = '123';
        chai.request(server).get(`/api/${invalidapiId}`).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Chercher un api non trouvé. - E", (done) => {
        const nonExistentapiId = '60d72b2f9b1d8b002f123456';
        chai.request(server).get(`/api/${nonExistentapiId}`).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
});

describe("GET - /apis", () => {
    it("Chercher plusieurs apis valide. -S", (done) => {
        chai.request(server).get('/apis').query({ id: _.map(apis, "_id") }).end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher plusieurs apis avec un id invalide. -E", (done) => {
        chai.request(server).get('/apis').query({ id: ["123456789", "123598745"] })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Chercher plusieurs apis avec un id valide mais inexistant. -E", (done) => {
        chai.request(server).get('/apis').query({ id: ["6679389b79a3a34adc0ef201", "6679388f79a3a34adc0ef200"] })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})


describe("GET - /apis", () => {
    it("Chercher plusieurs apis valide. -S", (done) => {
        chai.request(server).get('/apis_by_filters').query({ page: 1, limit: 2 }).end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Chercher plusieurs apis avec une query vide. -S", (done) => {
        chai.request(server).get('/apis_by_filters')
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                // expect(res.body.count).to.be.equal(44)
                done()
            })
    })
    it("Chercher plusieurs apis avec une chaîne de caractère dans page. -E", (done) => {
        chai.request(server).get('/apis_by_filters').query({ page: 'une phrase', limit: 2 })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})


describe("PUT - /api/:id", () => {
    it("Modifier un api valide. - S", (done) => {
        chai.request(server).put(`/api/${apis[0]._id}`).send({
            api_name: "New Weather Api",
        }).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Modifier un api avec un id invalide. - E", (done) => {
        chai.request(server).put(`/api/123456789`).send({
            rate_limit: 90,
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Modifier un api inexistant. - E", (done) => {
        chai.request(server).put(`/api/60c72b2f4f1a4c3d88d9a1d9`).send({
            api_name: "Non inexistant"
        }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Modifier un api avec un champ vide. - E", (done) => {
        chai.request(server).put(`/api/${apis[0]._id}`).send({
            api_key: ""
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
});


describe("PUT - /apis", () => {
    it("Modifier plusieurs apis. - S", (done) => {
        chai.request(server).put('/apis').query({ id: _.map(apis, '_id') }).send({
            api_name: "skfnsk", api_key: "0967412479172"
        })
            .end((err, res) => {
                // console.log(res)
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier plusieurs apis avec ID ivalide. -E", (done) => {
        chai.request(server).put('/apis').query({ id: ["1234", "616546"] }).send({
            api_key: ""
        }, {
            api_name: "fksjfqo"
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des apis inexistants. -E", (done) => {
        chai.request(server).put('/apis').query({ id: ["6679773379a3a34adc0f05bf"] }).send({
            api_name: "ppp"
        })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier des apis avec un champ vide. -E", (done) => {
        chai.request(server).put('/apis').query({ id: _.map(apis, '_id') }).send({
            api_name: "kjsnlqskckqs",
            api_key: ""
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des apis avec un id existant. -E", (done) => {
        chai.request(server).put('/apis').query({ _id: _.map(apis, '_id') }).send({
            api_name: apis[1].api_name
        },
        )
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("DELETE - /api/:id", () => {
    it("Supprimer un api valide. - S", (done) => {
        chai.request(server).delete(`/api/${apis[0]._id}`).end((err, res) => {
            res.should.have.status(200);
            done();
        });
    });
    it("Supprimer un api avec un id inexistant. - E", (done) => {
        chai.request(server).delete(`/api/60d72b2f9b1d8b002f123456`).end((err, res) => {
            res.should.have.status(404);
            done();
        });
    });
    it("Supprimer un api avec un id invalide. - E", (done) => {
        chai.request(server).delete('/api/123').end((err, res) => {
            res.should.have.status(405);
            done();
        });
    });
});


describe("DELETE - /apis", () => {
    it("Supprimer plusieurs apis. - S", (done) => {
        chai.request(server).delete('/apis').query({ id: _.map(apis, '_id') })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Supprimer plusieurs apis incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/apis/665f18739d3e172be5daf092&665f18739d3e172be5daf093')
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer plusieurs apis incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/apis').query({ id: ['123', '456'] })
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
