const chai = require("chai");
const chaiHttp = require("chai-http");
const expect = chai.expect;
const server = require('./../../server')
let should = chai.should();
const _ = require('lodash');
const { query } = require('express');

let user = null
var users = []
let token = ""
chai.use(chaiHttp)


// TEST CONTROLLER - Ajouter un utilisateur (tous les roles)
describe("POST - /register", () => {
    it("Ajouter un utilisateur . - S", (done) => {
        chai.request(server).post('/register').send({
            firstName: "Test",
            lastName: "Test",
            email: "testeur@gmail.com",
            password: "azerty",
        }).end((err, res) => {
            expect(res).to.have.status(201)
            users.push(res.body)
            done()
        });
    })
    it("Ajouter un utilisateur incorrect. (Sans password) - E", (done) => {
        chai.request(server).post('/register').send({
            firstName: "skos",
            lastName: 'Us',
            email: 'lutfu.us@gmil.com',
        }).end((err, res) => {
            // console.log(res)
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec email déjà existant) - E", (done) => {
        chai.request(server).post('/register').send({
            firstName: "luf",
            lastName: "Us",
            email: "testeur@gmail.com",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Ajouter un utilisateur incorrect. (Avec un email vide) - E", (done) => {
        chai.request(server).post('/register').send({
            firstName: "luffu",
            lastName: "skdqpo",
            email: "",
            password: "azerty"
        }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

// TEST CONTROLLER - Connecter un utilisateur (tous les roles)
describe("POST - /login", () => {
    it("Connexion utilisateur - S", (done) => {
        // console.log(users)
        chai.request(server).post('/login').send({
            email: "testeur@gmail.com",
            password: "azerty"
        }).end((err, res) => {
            res.should.have.status(200)
            token = res.body.token
            done()
        })
    })
    it("Connexion utilisateur - Identifiant incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            email: "email_incorrect",
            password: "azerty"
        }).end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
    it("Connexion utilisateur - Mot de passe incorrect - E", (done) => {
        chai.request(server).post('/login').send({
            email: "testeur@gmail.com",
            password: "password_incorrect"
        }).end((err, res) => {
            res.should.have.status(401)
            done()
        })
    })
})

describe("POST - /users", () => {
    it("Ajouter des utilisateurs. -S", (done) => {
        chai.request(server).post('/users').auth(token, { type: "bearer" }).send([{
            firstName: "Jordan",
            lastName: "tgt't'(gt",
            email: "jordanbouaissa2saa5@gmail.com",
            password: "5644959"
        },
        {
            firstName: "John",
            lastName: "vrfft",
            email: "jordanbouaissa2598@gmail.com",
            password: "okiàqkjnd"
        }]).end((err, res) => {
            //   console.log(res.body)
            users = [...users, ...res.body]
            expect(res).to.have.status(201)
            done()
        });
    })

    it("Ajouter des utilisateurs incorrect. (Sans password) - E", (done) => {
        chai.request(server).post('/users').auth(token, { type: "bearer" }).send([{
            firstName: "klzjdoqs",
            lastName: "gtrgt('",
            email: "jordanbouaissa2sqs5@gmail.com",
        },
        {
            firstName: "klzjdoodkqqs",
            lastName: "vrfft",
            email: "jordanbouaissazaz25@gmail.com",
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })

    it("Ajouter des utilisateurs correct sans authentification", (done) => {
        chai.request(server).post('/users').send([{
            lastName: "gtrgt(",
            phone: "0788588251"
        }, {
            lastName: "vrfft",
            phone: "0788588250"
        }]).end((err, res) => {
            expect(res).to.have.status(401)
            done()
        })
    })

    it("Ajouter des utilisateurs incorrect. (Avec un email existant) - E", (done) => {
        chai.request(server).post('/users').auth(token, { type: "bearer" }).send({
            firstName: "luqklnf",
            lastName: "Uskcqs",
            email: "testeur@gmail.com",
            password: "ok"
        },
            {
                firstName: "Jhn",
                lastName: "vrtsl",
                email: "jorduaissa2lsdl5@gmail.com",
                password: "içekdijçoqszd"
            }).end((err, res) => {
                expect(res).to.have.status(405)
                done()
            })
    })
    it("Ajouter des utilisateurs incorrect. (Avec un champ vide) - E", (done) => {
        chai.request(server).post('/users').auth(token, { type: "bearer" }).send([{
            firstName: "Jordan",
            lastName: "",
            email: "jordanbouaissa25@gmail.com",
            password: "iojdjqzodz"
        }, {
            firstName: "John",
            lastName: "",
            email: "jordanbouaissa25@gmail.com",
            password: "oiazjqsdqjopdk"
        }]).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
})

describe("GET - /user", () => {
    it("Chercher un utilisateur valide. -S", (done) => {
        chai.request(server).get('/user').auth(token, { type: "bearer" }).query({ fields: ["email"], value: users[0].email }).end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher un utilisateur avec un email valide. -S", (done) => {
        chai.request(server).get('/user').auth(token, { type: "bearer" }).query({ fields: ["email"], value: users[0].email }).end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher un utilisateur par un champ non autorisé. -E", (done) => {
        chai.request(server).get('/user').auth(token, { type: "bearer" }).query({ fields: ["firstName"], value: users[0].email }).end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Chercher un utilisateur sans aucune query. -E", (done) => {
        chai.request(server).get('/user').auth(token, { type: "bearer" }).end((err, res) => {
            res.should.have.status(405)
            done()
        })
    })
    it("Chercher un utilisateur existant . -E", (done) => {
        chai.request(server).get('/user').auth(token, { type: "bearer" }).query({ fields: ["email"], value: "Djolebg" }).end((err, res) => {
            res.should.have.status(404)
            done()
        })
    })
})

describe("GET - /user:id", () => {
    it("Chercher un utilisateur valide. - S", (done) => {
        chai.request(server).get(`/user/${users[0]._id}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(200)
            expect(res.body).to.be.an('object')
            expect(res.body).to.have.property('_id', users[0]._id)
            done()
        })
    })
    it("Chercher un utilisateur non valide. - E", (done) => {
        const invalidUserId = '145';
        chai.request(server).get(`/user/${invalidUserId}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(405)
            done()
        })
    })
    it("Chercher un utilisateur non trouvé. - E", (done) => {
        const nonExistentUserId = '60d72b2f9b1d8b002f123456';
        chai.request(server).get(`/user/${nonExistentUserId}`).auth(token, { type: "bearer" }).end((err, res) => {
            expect(res).to.have.status(404)
            done()
        })
    })
})

describe("GET - /users", () => {
    it("Chercher plusieurs utilisateurs valide. -S", (done) => {
        chai.request(server).get('/users').auth(token, { type: "bearer" }).query({ id: _.map(users, "_id") }).end((err, res) => {
            res.should.have.status(200)
            done()
        })
    })
    it("Chercher plusieurs utilisateurs avec un id invalide. -E", (done) => {
        chai.request(server).get('/users').auth(token, { type: "bearer" }).query({ id: ["123456789", "123598745"] })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Chercher plusieurs utilisateurs avec un id valide mais inexistant. -E", (done) => {
        chai.request(server).get('/users').auth(token, { type: "bearer" }).query({ id: ["6679389b79a3a34adc0ef201", "6679388f79a3a34adc0ef200"] })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
})


describe("GET - /users_by_filters", () => {
    it("Chercher plusieurs utilisateurs valide. -S", (done) => {
        chai.request(server).get('/users_by_filters').auth(token, { type: "bearer" }).query({ page: 1, limit: 2 }).end((err, res) => {
            res.should.have.status(200)
            expect(res.body.results).to.be.an('array')
            done()
        })
    })
    it("Chercher plusieurs utilisateurs avec une query vide. -S", (done) => {
        chai.request(server).get('/users_by_filters').auth(token, { type: "bearer" })
            .end((err, res) => {
                res.should.have.status(200)
                expect(res.body.results).to.be.an('array')
                expect(res.body.count).to.be.equal(4)
                done()
            })
    })
    it("Chercher plusieurs utilisateurs avec une chaîne de caractère dans page. -E", (done) => {
        chai.request(server).get('/users_by_filters').auth(token, { type: "bearer" }).query({ page: 'une phrase', limit: 2 })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})


describe("PUT - /user:id", () => {
    it("Modifier un utilisateur valide. -S", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(token, { type: "bearer" }).send({
            lastName: "Bouaissa",
        })
            .end((err, res) => {
                res.should.have.status(200)
                // console.log(users)
                done()
            })
    })
    it("Modifier un utilisateur avec un id invalide. - E", (done) => {

        chai.request(server).put(`/user/6679418179a3a34adc0ef218`).auth(token, { type: "bearer" }).send({
            firstName: "Jordan",
            lastName: "Bouaissa",
        }).end((err, res) => {
            expect(res).to.have.status(404);
            done();
        });
    });
    it("Modifier un utilisateur inexistant. - E", (done) => {
        chai.request(server).put(`/user/123456789`).auth(token, { type: "bearer" }).send({
            firstName: "Jordan",
            lastName: "Bouaissa",
            email: "laurentlaboue25@gmail.com"
        }).end((err, res) => {
            expect(res).to.have.status(405);
            done();
        });
    });
    it("Modifier un utilisateur avec un index existant. _ E", (done) => {
        chai.request(server).put('/user/' + users[0]._id).auth(token, { type: "bearer" }).send({
            email: users[1].email,
        })
            .end((err, res) => {
                // console.log(users)
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier un utilisateur avec un champ vide. - E", (done) => {
        chai.request(server).put('/user/' + users[0]._id)
            .auth(token, { type: 'bearer' })
            .send({
                email: "", password: "$2a$10$fZ8kX9n8ZVGFpl3NPkj37eV8F2eJvqY8Og2j1xuUgCIPReLYfqwvK", lastName: "Test"
            })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("PUT - /users", () => {
    it("Modifier plusieurs utilisateurs. - S", (done) => {
        chai.request(server).put('/users').auth(token, { type: "bearer" }).query({ id: _.map(users, '_id') }).send({
            firstName: "John Doe"
        })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("Modifier plusieurs utilisateurs avec ID invalide. -E", (done) => {
        chai.request(server).put('/users').auth(token, { type: "bearer" }).query({ id: ["1234", "616546"] }).send({
            firstName: "John Doe"
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des utilisateurs inexistants. -E", (done) => {
        chai.request(server).put('/users').auth(token, { type: "bearer" }).query({ id: ["6679773379a3a34adc0f05bf"] }).send({
            firstName: "Jordan"
        })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Modifier des utilisateurs avec un champ vide. -E", (done) => {
        chai.request(server).put('/users').auth(token, { type: "bearer" }).query({ id: _.map(users, '_id') }).send({
            firstName: "Jordan",
            lastName: "tgt't'(gt",
            email: "",
            password: "5644959"
        })
            .end((err, res) => {
                // console.log(res)
                res.should.have.status(405)
                done()
            })
    })
    it("Modifier des utilisateurs avec un index existant. -E", (done) => {
        chai.request(server).put('/users').auth(token, { type: "bearer" }).query({ id: _.map(users, '_id') }).send({
            email: users[1].email
        })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })
})

describe("DELETE - /user", () => {

    it("Supprimer un utilisateur. - S", (done) => {
        chai.request(server).delete('/user/' + users[1]._id)
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
    it("supprimer un utilisateur incorrect (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/user/665f18739d3e172be5daf092').auth(token, { type: "bearer" })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("supprimer un utilisateur incorrect (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/user/123').auth(token, { type: "bearer" })
            .end((err, res) => {
                res.should.have.status(405)
                done()
            })
    })


})

describe("DELETE - /users", () => {

    it("Supprimer plusieurs utilisateurs incorrects (avec un id invalide). - E", (done) => {
        chai.request(server).delete('/users').query({ id: [123, 456] })
            .auth(token, { type: 'bearer' })
            .end((err, res) => {
                // console.log(res.body)
                res.should.have.status(405)
                done()
            })
    })
    it("Supprimer plusieurs utilisateurs incorrects (avec un id inexistant). - E", (done) => {
        chai.request(server).delete('/users/665f18739d3e172be5daf092&665f18739d3e172be5daf093').auth(token, { type: "bearer" })
            .end((err, res) => {
                res.should.have.status(404)
                done()
            })
    })
    it("Supprimer plusieurs utilisateurs. - S", (done) => {
        chai.request(server).delete('/users').auth(token, { type: "bearer" }).query({ id: _.map(users, '_id') })
            .end((err, res) => {
                res.should.have.status(200)
                done()
            })
    })
})