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
const WeatherController = require('./controllers/WeatherController')
const ApiController = require('./controllers/ApiController')

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

// Création de endpoint /user pour l'ajout d'un utilisateur
app.post("/register", DatabaseMiddleware.checkConnexion, UserController.addOneUser);

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

// Création du endpoint /logout pour connecter un utilisateur
// app.post('/logout', DatabaseMiddleware.checkConnexion, passport.authenticate('jwt', { session: false }), UserController.logoutUser)

// Démarrage de notre serveur le port choisi


// Création du endpoint pour connecter un utilisateur
// app.post('/login', DatabaseMiddleware.checkConnexion, SettingController.loginUser)

// Création de l'endpoint /setting pour l'ajout d'un setting
app.post("/setting", DatabaseMiddleware.checkConnexion, SettingController.addOneSetting);

// Création de l'endpoint /settings pour l'ajout de plusieurs settings
app.post("/settings", DatabaseMiddleware.checkConnexion, SettingController.addManySettings);

// Création de l'endpoint /setting/:id pour la récupération d'un setting par ID
app.get("/setting/:id", DatabaseMiddleware.checkConnexion, SettingController.findOneSettingById);

// Création de l'endpoint /setting pour la récupération d'un setting
app.get("/setting", DatabaseMiddleware.checkConnexion, SettingController.findOneSetting);

// Création de l'endpoint /settings pour la récupération de plusieurs settings par ID
app.get("/settings", DatabaseMiddleware.checkConnexion, SettingController.findManySettingsById);

// Création de l'endpoint /settings_by_filters pour chercher des settings
app.get("/settings_by_filters", DatabaseMiddleware.checkConnexion, SettingController.findManySettings);

// Création de l'endpoint /setting/:id pour la modification d'un setting
app.put("/setting/:id", DatabaseMiddleware.checkConnexion, SettingController.updateOneSetting);

// Création de l'endpoint /settings pour la modification de plusieurs settings
app.put("/settings", DatabaseMiddleware.checkConnexion, SettingController.updateManySettings);

// Création de l'endpoint /setting/:id pour la suppression d'un setting
app.delete("/setting/:id", DatabaseMiddleware.checkConnexion, SettingController.deleteOneSetting);

// Création de l'endpoint /settings pour la suppression de plusieurs settings
app.delete("/settings", DatabaseMiddleware.checkConnexion, SettingController.deleteManySettings);


// Création de l'endpoint /weather pour l'ajout d'un setting
app.post("/weather", DatabaseMiddleware.checkConnexion, WeatherController.addOneWeather);

// Création de l'endpoint /weathers pour l'ajout de plusieurs settings
app.post("/weathers", DatabaseMiddleware.checkConnexion, WeatherController.addManyWeathers);

// Création de l'endpoint /weather/:id pour la récupération d'un setting par ID
app.get("/weather/:id", DatabaseMiddleware.checkConnexion, WeatherController.findOneWeatherById);

// Création de l'endpoint /weather pour la récupération d'un setting
app.get("/weather", DatabaseMiddleware.checkConnexion, WeatherController.findOneWeather);

// Création de l'endpoint /weathers pour la récupération de plusieurs settings par ID
app.get("/weathers", DatabaseMiddleware.checkConnexion, WeatherController.findManyWeathersById);

// Création de l'endpoint /weathers_by_filters pour chercher des settings
app.get("/weathers_by_filters", DatabaseMiddleware.checkConnexion, WeatherController.findManyWeathers);

// Création de l'endpoint /weather/:id pour la modification d'un setting
app.put("/weather/:id", DatabaseMiddleware.checkConnexion, WeatherController.updateOneWeather);

// Création de l'endpoint /weathers pour la modification de plusieurs settings
app.put("/weathers", DatabaseMiddleware.checkConnexion, WeatherController.updateManyWeathers);

// Création de l'endpoint /weather/:id pour la suppression d'un setting
app.delete("/weather/:id", DatabaseMiddleware.checkConnexion, WeatherController.deleteOneWeather);

// Création de l'endpoint /weathers pour la suppression de plusieurs settings
app.delete("/weathers", DatabaseMiddleware.checkConnexion, WeatherController.deleteManyWeathers);

// Création de l'endpoint /api pour l'ajout d'un setting
app.post("/api", DatabaseMiddleware.checkConnexion, ApiController.addOneApi);

// Création de l'endpoint /apis pour l'ajout de plusieurs settings
app.post("/apis", DatabaseMiddleware.checkConnexion, ApiController.addManyApis);

// Création de l'endpoint /api/:id pour la récupération d'un setting par ID
app.get("/api/:id", DatabaseMiddleware.checkConnexion, ApiController.findOneApiById);

// Création de l'endpoint /api pour la récupération d'un setting
app.get("/api", DatabaseMiddleware.checkConnexion, ApiController.findOneApi);

// Création de l'endpoint /apis pour la récupération de plusieurs settings par ID
app.get("/apis", DatabaseMiddleware.checkConnexion, ApiController.findManyApisById);

// Création de l'endpoint /apis_by_filters pour chercher des settings
app.get("/apis_by_filters", DatabaseMiddleware.checkConnexion, ApiController.findManyApis);

// Création de l'endpoint /api/:id pour la modification d'un setting
app.put("/api/:id", DatabaseMiddleware.checkConnexion, ApiController.updateOneApi);

// Création de l'endpoint /apis pour la modification de plusieurs settings
app.put("/apis", DatabaseMiddleware.checkConnexion, ApiController.updateManyApis);

// Création de l'endpoint /api/:id pour la suppression d'un setting
app.delete("/api/:id", DatabaseMiddleware.checkConnexion, ApiController.deleteOneApi);

// Création de l'endpoint /apis pour la suppression de plusieurs settings
app.delete("/apis", DatabaseMiddleware.checkConnexion, ApiController.deleteManyApis);

// Démarrage de notre serveur sur le port choisi
app.listen(Config.port, () => {
  Logger.info(`Serveur démarré dans le port ${Config.port}.`)
});

module.exports = app