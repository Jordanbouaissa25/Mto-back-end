const WeatherSchema = require('../schemas/Weather');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var Weather = mongoose.model('Weather', WeatherSchema)

Weather.createIndexes();

module.exports.addOneWeather = async function (weather, options, callback) {
    try {
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
            callback(error); // Autres erreurs
        }
    }
};



module.exports.addManyWeathers = async function (weathers, callback) {
    var errors = [];

    // Vérifier les erreurs de validation
    for (var i = 0; i < weathers.length; i++) {
        var weather = weathers[i];
        var new_weather = new Weather(weather);
        var error = new_weather.validateSync();
        if (error) {
            error = error['errors'];
            var text = Object.keys(error).map((e) => {
                return error[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(error), function (result, value) {
                result[value] = error[value]['properties']['message'];
            }, {});
            errors.push({
                msg: text,
                fields_with_error: Object.keys(error),
                fields: fields,
                index: i,
                type_error: "validator"
            });
        }
    }
    if (errors.length > 0) {
        callback(errors);
    } else {
        try {
            // Tenter d'insérer les utilisateurs
            //console.log(weathers)
            const data = await Weather.insertMany(weathers, { ordered: false });
            // console.log(data)
            callback(null, data);
        } catch (error) {
            if (error.code === 11000) { // Erreur de duplicité
                const duplicateErrors = error.writeErrors.map(err => {
                    // const field = Object.keys(err.keyValue)[0];
                    const field = err.err.errmsg.split(" dup key: { ")[1].split(':')[0].trim();
                    return {
                        msg: `Duplicate key error: ${field} must be unique.`,
                        fields_with_error: [field],
                        fields: { [field]: `The ${field} is already taken.` },
                        index: err.index,
                        type_error: "duplicate"
                    };
                });
                callback(duplicateErrors);
            } else {
                callback(error); // Autres erreurs
            }
        }
    }
};



module.exports.findOneWeatherById = function (weather_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [] }
    // console.log('Received weather_id:', weather_id); // Debugging log
    if (weather_id && mongoose.isValidObjectId(weather_id)) {
        Weather.findById(weather_id, null, opts)
            .then((value) => {
                //   console.log('Found value:', value); // Debugging log
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucun weather trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                // console.error('Error querying database:', err); // Debugging log
                callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
            });
    } else {
        console.error('Invalid ObjectId:', weather_id); // Debugging log
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};


module.exports.findOneWeather = function (tab_field, value, option, callback) {
    var opt = { populate: option && option.populate ? ["user_id"] : [] }
    var field_unique = ["humidity", "city"]
    if (tab_field && Array.isArray(tab_field) && value
        && _.filter(tab_field, (e) => {
            return field_unique.indexOf(e) == -1
        }).length == 0) {
        var obj_find = []
        _.forEach(tab_field, (e) => {
            obj_find.push({ [e]: value })
        })
        Weather.findOne({ $or: obj_find }, null, opt).then((value) => {
            if (value)
                callback(null, value.toObject())
            else {
                callback({ msg: 'Weather non trouvé.', type_error: 'no-found' })
            }
        }).catch((err) => {
            callback({ msg: "Error interne mongo", type_error: "error-mongo" })
        })
    }
    else {
        let msg = ""
        if (!tab_field || !Array.isArray(tab_field)) {
            msg += "Les champs de recherche sont incorrecte."
        }
        if (!value) {
            msg += msg ? " Et la valeur de recherche est vide." : "La valeur de recherche est vide."
        }
        if (_.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1 }).length > 0) {
            var field_not_authorized = _.filter(tab_field, (e) => { return field_unique.indexOf(e) == -1 })
            msg += msg ? ` Et (${field_not_authorized.join(',')}) ne sont pas des champs autorisés.` :
                `Les champs (${field_not_authorized.join(',')}) ne sont pas des champs de recherche autorisé`
            callback({ msg: msg, type_error: "no-valid", field_not_authorized: field_not_authorized })
        } else {
            callback({ msg: msg, type_error: "no-valid" })
        }
    }
}

module.exports.findManyWeathersById = function (weathers_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [], lean: true }
    if (weathers_id && Array.isArray(weathers_id) && weathers_id.length > 0 && weathers_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == weathers_id.length) {
        weathers_id = weathers_id.map((e) => { return new ObjectId(e) })
        Weather.find({ _id: weathers_id }, null, opts).then((value) => {
            try {
                if (value && Array.isArray(value) && value.length != 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun weather trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {

            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    }
    else if (weathers_id && Array.isArray(weathers_id) && weathers_id.length > 0 && weathers_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != weathers_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: weathers_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
    }
    else if (weathers_id && !Array.isArray(weathers_id)) {
        callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}


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
            console.log(e)
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
