const express = require("express");
const _ = require("lodash");
const bodyParser = require("body-parser");
const Config = require("./config");
const Logger = require('./utils/logger').pino
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


// Création de notre application express.js
const app = express();

// Démarrage de la database
require("./utils/database");

/* Ajoute de module de login */
const passport = require('./utils/passport')
/* Passport init */

var session = require('express-session')

app.use(session({
  secret: Config.secret_cookie,
  resave: false,
  saveUnintitialized: true,
  cookie: { secure: true }
}))

app.use(passport.initialize())
app.use(passport.session())

// Declaration des controller pour utilisateur
const UserController = require("./controllers/UserController");
const SettingController = require('./controllers/SettingController')

const DatabaseMiddleware = require('./middlewares/database')
const LoggerMiddleware = require('./middlewares/logger')

// Déclaration des middlewares à express
app.use(bodyParser.json(), LoggerMiddleware.addLogger);

// Configuration Swagger
const swaggerOptions = require(`./swagger.json`);
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))

/* --------------- Création des routes ------------ */

// Création du endpoint pour connecter un utilisateur
app.post('/login', DatabaseMiddleware.checkConnexion, UserController.loginUser)

// Création du endpoint /logout pour connecter un utilisateur
// app.post('/logout', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.logoutUser)

// Création de endpoint /user pour l'ajout d'un utilisateur
app.post("/user", DatabaseMiddleware.checkConnexion, UserController.addOneUser);

//Création de endpoint /users pour l'ajout de plusieurs utilisateurs
app.post("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.addManyUsers);

// Création du endpoint /user pour la récupération d'un utilisateur par ID
app.get("/user/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUserById);

// Création du endpoint /users pour la récupération d'un utilisateur
app.get("/user", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findOneUser)

// Création du endpoint /user pour chercher des utilisateurs par ID
app.get("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsersById);

// Création du endpoint /users pour chercher des utilisateurs 
app.get("/users_by_filters", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.findManyUsers);

// Création du endpoint /user pour la modification d'un utilisateur
app.put("/user/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateOneUser);

// Création du endpoint /users pour la modification de plusieurs utilisateurs
app.put("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.updateManyUsers);

// Création du endpoint /user pour la supression d'un utilisateur
app.delete("/user/:id", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.deleteOneUser);

// Création du endpoint /users pour la supression de plusieurs utilisateurs
app.delete("/users", DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.deleteManyUsers);

// Démarrage de notre serveur le port choisi


// Création du endpoint pour connecter un utilisateur
// app.post('/login', DatabaseMiddleware.checkConnexion, SettingController.loginUser)

// Création de l'endpoint /article pour l'ajout d'un article
app.post("/article", DatabaseMiddleware.checkConnexion, SettingController.addOneSetting);

// Création de l'endpoint /articles pour l'ajout de plusieurs articles
app.post("/articles", DatabaseMiddleware.checkConnexion, SettingController.addManySettings);

// Création de l'endpoint /article/:id pour la récupération d'un article par ID
app.get("/article/:id", DatabaseMiddleware.checkConnexion, SettingController.findOneSettingById);

// Création de l'endpoint /article pour la récupération d'un article
app.get("/article", DatabaseMiddleware.checkConnexion, SettingController.findOneSetting);

// Création de l'endpoint /articles pour la récupération de plusieurs articles par ID
app.get("/articles", DatabaseMiddleware.checkConnexion, SettingController.findManySettingsById);

// Création de l'endpoint /articles_by_filters pour chercher des articles
app.get("/articles_by_filters", DatabaseMiddleware.checkConnexion, SettingController.findManySettings);

// Création de l'endpoint /article/:id pour la modification d'un article
app.put("/article/:id", DatabaseMiddleware.checkConnexion, SettingController.updateOneSetting);

// Création de l'endpoint /articles pour la modification de plusieurs articles
app.put("/articles", DatabaseMiddleware.checkConnexion, SettingController.updateManySettings);

// Création de l'endpoint /article/:id pour la suppression d'un article
app.delete("/article/:id", DatabaseMiddleware.checkConnexion, SettingController.deleteOneSetting);

// Création de l'endpoint /articles pour la suppression de plusieurs articles
app.delete("/articles", DatabaseMiddleware.checkConnexion, SettingController.deleteManySettings);

// Démarrage de notre serveur sur le port choisi
app.listen(Config.port, () => {
  Logger.info(`Serveur démarré dans le port ${Config.port}.`)
});

module.exports = app