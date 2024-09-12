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

/**
 * @swagger
 * /addOneWeather:
 *  post:
 *    summary: Add a Weather entry
 *    description: Adds a new weather entry for a specified city.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: query
 *        name: city
 *        required: true
 *        description: City for which the weather data is added
 *        schema:
 *          type: string
 *          example: "Paris"
 *    responses:
 *       201:
 *          description: Weather successfully created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: Name of the city
 *                    example: "Paris"
 *                  weather:
 *                    type: string
 *                    description: Weather information
 *                    example: "Sunny, 25°C"
 *       404:
 *          description: City not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "City not found"
 *       405:
 *          description: Validation error or duplicate entry
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "duplicate"
 *                  message:
 *                    type: string
 *                    example: "Duplicate weather entry for this city"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /findOneWeatherById/{id}:
 *  get:
 *    summary: Find a Weather entry by ID
 *    description: Retrieves weather information for a specific entry by its ID.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the weather entry to retrieve
 *        schema:
 *          type: string
 *          example: "605c5f48b2f4f1001f3eaf20"
 *      - in: query
 *        name: populate
 *        required: false
 *        description: Populate related data if needed
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Weather entry successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: City name
 *                    example: "Paris"
 *                  weather:
 *                    type: string
 *                    description: Weather details
 *                    example: "Sunny, 25°C"
 *       404:
 *          description: Weather entry not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Weather entry not found"
 *       405:
 *          description: Invalid weather ID
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid weather ID"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /findOneWeather:
 *  get:
 *    summary: Find a Weather entry
 *    description: Retrieves a weather entry based on specified fields and value.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: query
 *        name: fields
 *        description: Fields to include in the search
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        example: ["city", "weather"]
 *      - in: query
 *        name: value
 *        required: true
 *        description: Value to search for in the specified fields
 *        schema:
 *          type: string
 *          example: "Paris"
 *      - in: query
 *        name: populate
 *        description: Populate related data if needed
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Weather entry successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: Name of the city
 *                    example: "Paris"
 *                  weather:
 *                    type: string
 *                    description: Weather details
 *                    example: "Sunny, 25°C"
 *       404:
 *          description: Weather entry not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Weather entry not found"
 *       405:
 *          description: Invalid search criteria
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid search criteria"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /findManyWeathers:
 *  get:
 *    summary: Find multiple Weather entries
 *    description: Retrieves multiple weather entries based on search parameters with pagination.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: query
 *        name: q
 *        description: Search query for weather entries
 *        schema:
 *          type: string
 *        example: "Paris"
 *      - in: query
 *        name: page
 *        description: Page number for pagination
 *        schema:
 *          type: integer
 *          example: 1
 *      - in: query
 *        name: limit
 *        description: Number of entries per page
 *        schema:
 *          type: integer
 *          example: 10
 *      - in: query
 *        name: populate
 *        description: Populate related data if needed
 *        schema:
 *          type: boolean
 *    responses:
 *       200:
 *          description: Weather entries successfully retrieved
 *          content:
 *            application/json:
 *              schema:
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    city:
 *                      type: string
 *                      description: Name of the city
 *                      example: "Paris"
 *                    weather:
 *                      type: string
 *                      description: Weather details
 *                      example: "Sunny, 25°C"
 *       405:
 *          description: Invalid query parameters
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid query parameters"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /deleteOneWeather:
 *  delete:
 *    summary: Delete a Weather entry
 *    description: Deletes a specific weather entry by its ID.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the weather entry to delete
 *        schema:
 *          type: string
 *          example: "605c5f48b2f4f1001f3eaf20"
 *    responses:
 *       200:
 *          description: Weather entry successfully deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Weather entry deleted successfully"
 *       404:
 *          description: Weather entry not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Weather entry not found"
 *       405:
 *          description: Invalid weather entry ID
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid weather entry ID"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /deleteManyWeathers:
 *  delete:
 *    summary: Delete multiple Weather entries
 *    description: Deletes multiple weather entries specified by their IDs.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: query
 *        name: id
 *        description: IDs of the weather entries to delete
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        example: ["605c5f48b2f4f1001f3eaf20", "605c5f48b2f4f1001f3eaf21"]
 *    responses:
 *       200:
 *          description: Weather entries successfully deleted
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Weather entries deleted successfully"
 *       404:
 *          description: Some weather entries not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Some weather entries not found"
 *       405:
 *          description: Invalid weather entry IDs
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-valid"
 *                  message:
 *                    type: string
 *                    example: "Invalid weather entry IDs"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /updateOneWeather:
 *  put:
 *    summary: Update a Weather entry
 *    description: Updates a specific weather entry by its ID.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: path
 *        name: id
 *        required: true
 *        description: ID of the weather entry to update
 *        schema:
 *          type: string
 *          example: "605c5f48b2f4f1001f3eaf20"
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                    city:
 *                      type: string
 *                      description: Name of the city
 *                      example: "Paris"
 *                    weather:
 *                      type: string
 *                      description: Updated weather details
 *                      example: "Cloudy, 20°C"
 *    responses:
 *       200:
 *          description: Weather entry successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  city:
 *                    type: string
 *                    description: Name of the city
 *                    example: "Paris"
 *                  weather:
 *                    type: string
 *                    description: Updated weather details
 *                    example: "Cloudy, 20°C"
 *       404:
 *          description: Weather entry not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Weather entry not found"
 *       405:
 *          description: Validation error or invalid data
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
 *                    example: "Validation error"
 *       500:
 *          description: Internal server error
 */


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

/**
 * @swagger
 * /updateManyWeathers:
 *  put:
 *    summary: Update multiple Weather entries
 *    description: Updates multiple weather entries specified by their IDs.
 *    tags:
 *      - Weather
 *    parameters:
 *      - in: query
 *        name: id
 *        description: IDs of the weather entries to update
 *        schema:
 *          type: array
 *          items:
 *            type: string
 *        example: ["605c5f48b2f4f1001f3eaf20", "605c5f48b2f4f1001f3eaf21"]
 *    requestBody:
 *       required: true
 *       content:
 *          application/json:
 *              schema:
 *                  type: object
 *                  properties:
 *                    city:
 *                      type: string
 *                      description: Name of the city
 *                      example: "Paris"
 *                    weather:
 *                      type: string
 *                      description: Updated weather details
 *                      example: "Partly cloudy, 22°C"
 *    responses:
 *       200:
 *          description: Weather entries successfully updated
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  message:
 *                    type: string
 *                    example: "Weather entries updated successfully"
 *       404:
 *          description: Some weather entries not found
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  type_error:
 *                    type: string
 *                    example: "no-found"
 *                  message:
 *                    type: string
 *                    example: "Some weather entries not found"
 *       405:
 *          description: Validation error or invalid data
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
 *                    example: "Validation error"
 *       500:
 *          description: Internal server error
 */

