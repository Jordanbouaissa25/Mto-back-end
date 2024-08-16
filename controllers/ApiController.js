const ApiService = require('../services/ApiService');
const LoggerHttp = require('../utils/logger').http

// La fonction permet d'ajouter un Api.
module.exports.addOneApi = function (req, res) {
    req.log.info("Création d'un Api");
    ApiService.addOneApi(req.body, null, function (err, value) {

        if (err && err.type_error == "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && err.type_error == "validator") {
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

// La fonction permet d'ajouter plusieurs Apis.
module.exports.addManyApis = function (req, res) {
    req.log.info("Création de plusieurs Apis");
    ApiService.addManyApis(req.body, function (err, value) {
        if (err) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

// La fonction permet de chercher un Api par ID.
module.exports.findOneApiById = function (req, res) {
    req.log.info("Chercher un Api");
    var opts = { populate: req.query.populate }
    ApiService.findOneApiById(req.params.id, opts, function (err, value) {
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

// La fonction permet de chercher un Api.
module.exports.findOneApi = function (req, res) {
    var fields = req.query.fields;
    if (fields && !Array.isArray(fields)) {
        fields = [fields];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher un Api");
    ApiService.findOneApi(fields, req.query.value, opts, function (err, value) {
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

// La fonction permet de chercher plusieurs Apis.
module.exports.findManyApis = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q;
    var opts = { populate: req.query.populate }
    req.log.info("Chercher des Apis");
    ApiService.findManyApis(search, page, limit, opts, (err, value) => {
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

// La fonction permet de chercher plusieurs Apis par ID.
module.exports.findManyApisById = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher plusieurs Apis");
    ApiService.findManyApisById(arg, opts, function (err, value) {
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

// La fonction permet de supprimer un Api.
module.exports.deleteOneApi = function (req, res) {
    req.log.info("Supprimer un Api");
    ApiService.deleteOneApi(req.params.id, function (err, value) {
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

// La fonction permet de supprimer plusieurs Apis.
module.exports.deleteManyApis = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    req.log.info("Supprimer plusieurs Apis");
    ApiService.deleteManyApis(arg, function (err, value) {
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

// La fonction permet de modifier un Api.
module.exports.updateOneApi = function (req, res) {
    const ApiId = req.params.id;
    const ApiData = req.body;
    req.log.info("Modifier un Api");
    ApiService.updateOneApi(ApiId, ApiData, (err, value) => {
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

// La fonction permet de modifier plusieurs Apis.
module.exports.updateManyApis = function (req, res) {
    let ApisId = req.query.id;
    const updateData = req.body;
    if (ApisId && !Array.isArray(ApisId)) {
        ApisId = [ApisId];
    }
    req.log.info("Modifier plusieurs Apis");
    ApiService.updateManyApis(ApisId, updateData, (err, value) => {
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
