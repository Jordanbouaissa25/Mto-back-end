const SettingService = require('../services/SettingService');
const LoggerHttp = require('../utils/logger').http

// La fonction permet d'ajouter un Setting.
module.exports.addOneSetting = function (req, res) {
    req.log.info("Création d'un Setting");
    SettingService.addOneSetting(req.body, null, function (err, value) {
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

// La fonction permet d'ajouter plusieurs Settings.
module.exports.addManySettings = function (req, res) {
    req.log.info("Création de plusieurs Settings");
    SettingService.addManySettings(req.body, function (err, value) {
        if (err) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 201;
            res.send(value);
        }
    });
};

/**
 * @swagger
 * /addManySettings:
 *  post:
 *    summary: Ajouter plusieurs Settings
 *    description: Ajoute plusieurs Settings dans le système en une seule requête.
 *    tags:
 *      - Settings
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: array
 *                  items:
 *                    type: object
 *                    properties:
 *                      name:
 *                        type: string
 *                        description: Nom du Setting
 *                        example: "exampleSetting"
 *                      value:
 *                        type: string
 *                        description: Valeur du Setting
 *                        example: "exampleValue"
 *                  minItems: 1
 *    responses:
 *       201:
 *          description: Settings créés avec succès
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    id:
 *                      type: string
 *                      description: Identifiant du Setting créé
 *                      example: "12345"
 *                    name:
 *                      type: string
 *                      description: Nom du Setting
 *                      example: "exampleSetting"
 *                    value:
 *                      type: string
 *                      description: Valeur du Setting
 *                      example: "exampleValue"
 *       405:
 *          description: Erreur de validation
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "validator"
 *                  message:
 *                    type: string
 *                    example: "Erreur de validation"
 *       500:
 *          description: Erreur interne du serveur
 */


// La fonction permet de chercher un Setting par ID.
module.exports.findOneSettingById = function (req, res) {
    req.log.info("Chercher un Setting");
    var opts = { populate: req.query.populate }
    SettingService.findOneSettingById(req.params.id, opts, function (err, value) {
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

// La fonction permet de chercher un Setting.
module.exports.findOneSetting = function (req, res) {
    var fields = req.query.fields;
    if (fields && !Array.isArray(fields)) {
        fields = [fields];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher un Setting");
    SettingService.findOneSetting(fields, req.query.value, opts, function (err, value) {
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

// La fonction permet de chercher plusieurs Settings.
module.exports.findManySettings = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q;
    var opts = { populate: req.query.populate }
    req.log.info("Chercher des Settings");
    SettingService.findManySettings(search, page, limit, opts, (err, value) => {
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

// La fonction permet de chercher plusieurs Settings par ID.
module.exports.findManySettingsById = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    var opts = { populate: req.query.populate }
    req.log.info("Chercher plusieurs Settings");
    SettingService.findManySettingsById(arg, opts, function (err, value) {
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

// La fonction permet de supprimer un Setting.
module.exports.deleteOneSetting = function (req, res) {
    req.log.info("Supprimer un Setting");
    SettingService.deleteOneSetting(req.params.id, function (err, value) {
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

// La fonction permet de supprimer plusieurs Settings.
module.exports.deleteManySettings = function (req, res) {
    var arg = req.query.id;
    if (arg && !Array.isArray(arg)) {
        arg = [arg];
    }
    req.log.info("Supprimer plusieurs Settings");
    SettingService.deleteManySettings(arg, function (err, value) {
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

// La fonction permet de modifier un Setting.
module.exports.updateOneSetting = function (req, res) {
    const SettingId = req.params.id;
    const SettingData = req.body;
    req.log.info("Modifier un Setting");
    SettingService.updateOneSetting(SettingId, SettingData, (err, value) => {
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

// La fonction permet de modifier plusieurs Settings.
module.exports.updateManySettings = function (req, res) {
    let SettingsId = req.query.id;
    const updateData = req.body;
    if (SettingsId && !Array.isArray(SettingsId)) {
        SettingsId = [SettingsId];
    }
    req.log.info("Modifier plusieurs Settings");
    SettingService.updateManySettings(SettingsId, updateData, (err, value) => {
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
