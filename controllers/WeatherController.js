const WeatherService = require('../services/WeatherService');
const LoggerHttp = require('../utils/logger').http


// La fonction permet d'ajouter un Weather.
module.exports.addOneWeather = function (req, res) {
    req.log.info("Création d'un Weather");
    WeatherService.addOneWeather(req.query.city, req.user._id, null, function (err, value) {

        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "duplicate") {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

// La fonction permet de chercher un Weather par ID.
module.exports.findOneWeatherById = function (req, res) {
    req.log.info("Chercher un Weather");
    var opts = { populate: req.query.populate }
    WeatherService.findOneWeatherById(req.params.id, opts, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// La fonction permet de chercher un Weather.
module.exports.findOneWeather = function (req, res) {
    var fields = req.query.fields;
    if (fields && !Array.isArray(fields)) {
        fields = [fields];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher un Weather");
    WeatherService.findOneWeather(fields, req.query.value, opts, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// La fonction permet de chercher plusieurs Weathers.
module.exports.findManyWeathers = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q;
    var opts = { populate: req.query.populate }
    req.log.info("Chercher des Weathers");
    WeatherService.findManyWeathers(search, page, limit, opts, (err, value) => {
        if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// La fonction permet de supprimer un Weather.
module.exports.deleteOneWeather = function (req, res) {
    req.log.info("Supprimer un Weather");
    WeatherService.deleteOneWeather(req.params.id, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// La fonction permet de supprimer plusieurs Weathers.
module.exports.deleteManyWeathers = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    req.log.info("Supprimer plusieurs Weathers");
    WeatherService.deleteManyWeathers(arg, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// La fonction permet de modifier un Weather.
module.exports.updateOneWeather = function (req, res) {
    const WeatherId = req.params.id;
    const WeatherData = req.body;
    req.log.info("Modifier un Weather");
    WeatherService.updateOneWeather(WeatherId, WeatherData, (err, value) => {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "validator") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && (err.type_error == "no-valid" || err.type_error == "validator" || err.type_error == "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

// La fonction permet de modifier plusieurs Weathers.
module.exports.updateManyWeathers = function (req, res) {
    let WeathersId = req.query.id;
    const updateData = req.body;
    if (WeathersId && !Array.isArray(WeathersId)) {
        WeathersId = [WeathersId];
    }
    req.log.info("Modifier plusieurs Weathers");
    WeatherService.updateManyWeathers(WeathersId, updateData, (err, value) => {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "no-valid") {
            res.statusCode = 405;
            res.send(err);
        } else if (err && (err.type_error == "validator" || err.type_error == "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};
