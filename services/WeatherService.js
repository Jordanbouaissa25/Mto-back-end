const WeatherSchema = require('../schemas/Weather');
const http = require('../utils/http').http
const appid = require('../config').appid
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var Weather = mongoose.model('Weather', WeatherSchema)

Weather.createIndexes();

module.exports.addOneWeather = async function (city, user_id, options, callback) {
    // console.log("ok")
    try {
        const responseOfApi = await http.get(`?q=${city}&units=metric&appid=${appid}`)
        // console.log(responseOfApi.data)
        const weather = {
            data_id: responseOfApi.data.id,
            user_id: user_id,
            lon: responseOfApi.data.coord.lon,
            lat: responseOfApi.data.coord.lat,
            sunset: responseOfApi.data.sys.sunset,
            sunrise: responseOfApi.data.sys.sunrise,
            pressure: responseOfApi.data.main.pressure,
            visibility: responseOfApi.data.visibility,
            city: city,
            temp: responseOfApi.data.main.temp,
            humidity: responseOfApi.data.main.humidity,
            wind: responseOfApi.data.wind.speed,
            description: responseOfApi.data.weather[0].description,
            icon: responseOfApi.data.weather[0].icon,
            country: responseOfApi.data.sys.country,
            timezone: responseOfApi.data.timezone
        }
        var new_weather = new Weather(weather);
        var errors = new_weather.validateSync();
        if (errors) {
            errors = errors['errors'];
            var text = Object.keys(errors).map((e) => {
                return errors[e]['properties'];
            }).join(' ');
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties'];
            }, {});
            var err = {
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            };
            callback(err);
        } else {
            await new_weather.save();
            callback(null, new_weather.toObject());
        }
    } catch (error) {
        // console.log(error)
        if (error.code === 11000) { // Erreur de duplicité
            var field = Object.keys(error.keyValue)[0];
            var err = {
                msg: `Duplicate key error: ${field} must be unique.`,
                fields_with_error: [field],
                fields: { [field]: `The ${field} is already taken.` },
                type_error: "duplicate"
            };
            callback(err);
        } else {
            if (error.response.data.cod === "404") {
                return callback({ msg: "ville renseignée n'existe pas", type_error: "no-found" })
            }
            if (error.response.data.cod === "400") {
                return callback({ msg: "informations renseignées non valides", type_error: "no-valid" })
            }
            callback(error); // Autres erreurs
        }
    }
};



module.exports.addManyWeathers = async function (cities, user_id, options, callback) {
    const weathers = [];
    const errors = [];

    for (const city of cities) {
        try {
            const responseOfApi = await http.get(`?q=${city}&appid=${appid}`);
            // console.log(responseOfApi)
            const weather = {
                data_id: responseOfApi.data.id,
                user_id: user_id,
                lon: responseOfApi.data.coord.lon,
                lat: responseOfApi.data.coord.lat,
                sunset: responseOfApi.data.sys.sunset,
                sunrise: responseOfApi.data.sys.sunrise,
                pressure: responseOfApi.data.main.pressure,
                visibility: responseOfApi.data.visibility,
                city: city,
                temp: responseOfApi.data.main.temp,
                humidity: responseOfApi.data.main.humidity,
                wind: responseOfApi.data.wind.speed,
                timezone: responseOfApi.data.timezone,
                name: responseOfApi.data.name
            };
            // console.log(responseOfApi.data.sys.sunset)
            const new_weather = new Weather(weather);
            const validationErrors = new_weather.validateSync();

            if (validationErrors) {
                const errorDetails = validationErrors['errors'];
                const errorMsg = Object.keys(errorDetails).map((e) => {
                    return errorDetails[e]['properties']['message'];
                }).join(' ');

                const fields = _.transform(Object.keys(errorDetails), function (result, value) {
                    result[value] = errorDetails[value]['properties']['message'];
                }, {});

                errors.push({
                    msg: errorMsg,
                    fields_with_error: Object.keys(errorDetails),
                    fields: fields,
                    city: city,
                    type_error: "validator"
                });
            } else {
                weathers.push(new_weather);
            }
        } catch (error) {
            // console.log(`Error processing city ${city}:`, error);
            if (error.code === 11000) { // Duplicate key error
                const field = Object.keys(error.keyValue)[0];
                errors.push({
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    city: city,
                    type_error: "duplicate"
                });
            } else if (error.response && error.response.data.cod === "404") {
                errors.push({ msg: "ville renseignée n'existe pas", type_error: "no-found", city: city });
            } else if (error.response && error.response.data.cod === "400") {
                errors.push({ msg: "informations renseignées non valides", type_error: "no-valid", city: city });
            } else {
                errors.push({ msg: "Une erreur inattendue est survenue", type_error: "unknown", city: city, error });
            }
        }
    }

    if (errors.length > 0) {
        callback({ msg: "Certaines villes n'ont pas été ajoutées", errors, type_error: "multi" });
        return;
    }

    try {
        const data = await Weather.insertMany(weathers, { ordered: false });
        callback(null, data);
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error during batch insert
            const duplicateErrors = error.writeErrors.map(err => {
                const field = err.err.errmsg.split(" dup key: { ")[1].split(':')[0].trim();
                return {
                    msg: `Duplicate key error: ${field} must be unique.`,
                    fields_with_error: [field],
                    fields: { [field]: `The ${field} is already taken.` },
                    index: err.index,
                    type_error: "duplicate"
                };
            });
            callback({ msg: "Certaines villes n'ont pas été ajoutées", errors: duplicateErrors, type_error: "multi" });
        } else {
            callback(error); // Other errors
        }
    }
};

module.exports.findOneWeatherById = async function (weather_id, options, callback) {
    try {
        // Vérifier si l'ID fourni est un ObjectId valide
        if (!mongoose.isValidObjectId(weather_id)) {
            return callback({
                msg: "ObjectId non conforme.",
                type_error: 'no-valid'
            });
        }

        // Options pour la requête, incluant la population de champs associés si spécifié
        const opts = { populate: options && options.populate ? ["user_id"] : [] };

        // Rechercher le weather par son ID
        const weather = await Weather.findById(weather_id, null, opts).exec();

        // Gérer les cas où aucun weather correspondant n'est trouvé
        if (!weather) {
            return callback({
                msg: "Aucun weather trouvé.",
                type_error: "no-found"
            });
        }

        // Retourner les données trouvées
        return callback(null, weather.toObject());
    } catch (error) {
        // Gérer les erreurs potentielles lors de la requête MongoDB
        console.error('Erreur lors de la recherche en base de données:', error);
        return callback({
            msg: "Impossible de chercher l'élément.",
            type_error: "error-mongo"
        });
    }
};




module.exports.findOneWeather = function (tab_field, value, option, callback) {
    const opt = { populate: option && option.populate ? ["user_id"] : [] };
    const field_unique = ["humidity", "city"];

    // Validation des champs
    if (
        tab_field &&
        Array.isArray(tab_field) &&
        value &&
        _.filter(tab_field, (e) => field_unique.indexOf(e) === -1).length === 0
    ) {
        const obj_find = _.map(tab_field, (e) => ({ [e]: value }));

        // Requête à MongoDB
        Weather.findOne({ $or: obj_find }, null, opt)
            .then((result) => {
                if (result) {
                    callback(null, result.toObject());
                } else {
                    callback({ msg: 'Weather non trouvé.', type_error: 'no-found' });
                }
            })
            .catch((err) => {
                callback({ msg: "Erreur interne MongoDB", type_error: "error-mongo" });
            });
    } else {
        // Construction du message d'erreur
        let msg = "";

        if (!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrects.";
        }

        if (!value) {
            msg += msg ? " Et la valeur de recherche est vide." : "La valeur de recherche est vide.";
        }

        const field_not_authorized = _.filter(tab_field, (e) => field_unique.indexOf(e) === -1);
        if (field_not_authorized.length > 0) {
            msg += msg
                ? ` Et (${field_not_authorized.join(',')}) ne sont pas des champs autorisés.`
                : `Les champs (${field_not_authorized.join(',')}) ne sont pas des champs de recherche autorisés.`;

            callback({
                msg: msg,
                type_error: "no-valid",
                field_not_authorized: field_not_authorized,
            });
        } else {
            callback({ msg: msg, type_error: "no-valid" });
        }
    }
};

module.exports.findManyWeathers = function (search, page, limit, options, callback) {
    page = !page ? 1 : parseInt(page)
    limit = !limit ? 10 : parseInt(limit)
    var populate = options && options.populate ? ['user_id'] : []
    if (typeof page !== "number" || typeof limit !== "number" || isNaN(page) || isNaN(limit)) {
        callback({ msg: `format de ${typeof page !== "number" ? "page" : "limit"} est incorrect`, type_error: "no-valid" })
    } else {
        var query_mongo = search ? {
            $or: _.map(["name"], (e) => {
                return { [e]: { $regex: search } }
            })
        } : {}
        Weather.countDocuments(query_mongo).then((value) => {
            if (value > 0) {
                const skip = ((page - 1) * limit)
                Weather.find(query_mongo, null, { skip: skip, limit: limit, populate: populate, lean: true }).then((results) => {
                    callback(null, {
                        count: value,
                        results: results
                    })
                })
            } else {
                callback(null, { count: 0, results: [] })
            }
        }).catch((e) => {
            // console.log(e)
            callback(e)
        })
    }
}

module.exports.updateOneWeather = function (weather_id, update, callback) {
    if (weather_id && mongoose.isValidObjectId(weather_id)) {
        Weather.findByIdAndUpdate(weather_id, update, { new: true, runValidators: true })
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Weather non trouvé.", type_error: "no-found" });
                }
            })
            .catch((errors) => {
                if (errors.code === 11000) {
                    var field = Object.keys(errors.keyPattern)[0]
                    const duplicateErrors = {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        type_error: "duplicate"
                    };
                    callback(duplicateErrors)
                } else {
                    errors = errors['errors']
                    var text = Object.keys(errors).map((e) => {
                        return errors[e]['properties']['message']
                    }).join(' ')
                    var fields = _.transform(Object.keys(errors), function (result, value) {
                        result[value] = errors[value]['properties']['message'];
                    }, {});
                    var err = {
                        msg: text,
                        fields_with_error: Object.keys(errors),
                        fields: fields,
                        type_error: "validator"
                    }
                    callback(err)
                }
            })

    } else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
};

module.exports.updateManyWeathers = function (weathers_id, update, callback) {
    if (Array.isArray(weathers_id) && weathers_id.length > 0 && weathers_id.every(mongoose.isValidObjectId)) {
        const ids = weathers_id.map(id => new ObjectId(id));
        Weather.updateMany({ _id: { $in: ids } }, update, { runValidators: true })
            .then((value) => {
                if (value.modifiedCount > 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun weather trouvé.", type_error: "no-found" });
                }
            })
            .catch((errors) => {
                if (errors.code === 11000) {
                    var field = Object.keys(errors.keyPattern)[0]
                    const duplicateErrors = {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        type_error: "duplicate"
                    };
                    callback(duplicateErrors)
                } else {
                    errors = errors['errors']
                    var text = Object.keys(errors).map((e) => {
                        return errors[e]['properties']['message']
                    }).join(' ')
                    var fields = _.transform(Object.keys(errors), function (result, value) {
                        result[value] = errors[value]['properties']['message'];
                    }, {});
                    var err = {
                        msg: text,
                        fields_with_error: Object.keys(errors),
                        fields: fields,
                        type_error: "validator"
                    }
                }
                callback(err)
            })

    }
    else {
        callback({ msg: "Id invalide.", type_error: 'no-valid' })
    }
};

module.exports.deleteOneWeather = function (weather_id, callback) {
    if (weather_id && mongoose.isValidObjectId(weather_id)) {
        Weather.findByIdAndDelete(weather_id)
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Weather non trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                callback({ msg: "Impossible de supprimer l'élément.", type_error: "error-mongo" });
            });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};

module.exports.deleteManyWeathers = function (weathers_id, callback) {
    if (Array.isArray(weathers_id) && weathers_id.length > 0 && weathers_id.every(mongoose.isValidObjectId)) {
        const ids = weathers_id.map(id => new ObjectId(id));
        Weather.deleteMany({ _id: { $in: ids } })
            .then((value) => {
                callback(null, value);
            })
            .catch((err) => {
                callback({ msg: "Erreur lors de la suppression.", type_error: "error-mongo" });
            });
    } else {
        callback({ msg: "Liste d'IDs non conforme.", type_error: 'no-valid' });
    }
};

function handleValidationErrors(errors, index = null) {
    errors = errors['errors'];
    const text = Object.keys(errors).map(e => errors[e]['properties']['message']).join(' ');
    const fields = _.transform(Object.keys(errors), (result, value) => {
        result[value] = errors[value]['properties']['message'];
    }, {});
    return {
        msg: text,
        fields_with_error: Object.keys(errors),
        fields: fields,
        index: index,
        type_error: "validator"
    };
}

function handleMongoError(error, callback) {
    if (error.code === 11000) { // Erreur de duplicité
        const field = Object.keys(error.keyValue)[0];
        const err = {
            msg: `Duplicate key error: ${field} must be unique.`,
            fields_with_error: [field],
            fields: { [field]: `The ${field} is already taken.` },
            type_error: "duplicate"
        };
        callback(err);
    } else {
        callback(error); // Autres erreurs
    }
}
