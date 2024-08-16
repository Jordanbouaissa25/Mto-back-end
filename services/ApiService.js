const ApiSchema = require('../schemas/Api');
const _ = require('lodash');
const async = require('async');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

var Api = mongoose.model('Api', ApiSchema)

Api.createIndexes();

module.exports.addOneApi = async function (api, options, callback) {
    try {
        var new_api = new Api(api);
        var errors = new_api.validateSync();
        if (errors) {
            errors = errors['errors'];
            var text = Object.keys(errors).map((e) => {
                return errors[e]['properties']['message'];
            }).join(' ');
            var fields = _.transform(Object.keys(errors), function (result, value) {
                result[value] = errors[value]['properties']['message'];
            }, {});
            var err = {
                msg: text,
                fields_with_error: Object.keys(errors),
                fields: fields,
                type_error: "validator"
            };
            callback(err);
        } else {
            await new_api.save();
            callback(null, new_api.toObject());
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



module.exports.addManyApis = async function (apis, callback) {
    var errors = [];

    // Vérifier les erreurs de validation
    for (var i = 0; i < apis.length; i++) {
        var api = apis[i];
        var new_api = new Api(api);
        var error = new_api.validateSync();
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
            const data = await Api.insertMany(apis, { ordered: false });
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



module.exports.findOneApiById = function (api_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [] }
    // console.log('Received api_id:', api_id); // Debugging log
    if (api_id && mongoose.isValidObjectId(api_id)) {
        Api.findById(api_id, null, opts)
            .then((value) => {
                //   console.log('Found value:', value); // Debugging log
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Aucun api trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                console.error('Error querying database:', err); // Debugging log
                callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
            });
    } else {
        console.error('Invalid ObjectId:', api_id); // Debugging log
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};


module.exports.findOneApi = function (tab_field, value, option, callback) {
    var opt = { populate: option && option.populate ? ["user_id"] : [] }
    var field_unique = ["api_name", "api_key"]
    if (tab_field && Array.isArray(tab_field) && value
        && _.filter(tab_field, (e) => {
            return field_unique.indexOf(e) == -1
        }).length == 0) {
        var obj_find = []
        _.forEach(tab_field, (e) => {
            obj_find.push({ [e]: value })
        })
        Api.findOne({ $or: obj_find }, null, opt).then((value) => {
            if (value)
                callback(null, value.toObject())
            else {
                callback({ msg: 'Api non trouvé.', type_error: 'no-found' })
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

module.exports.findManyApisById = function (apis_id, options, callback) {
    var opts = { populate: options && options.populate ? ["user_id"] : [], lean: true }
    if (apis_id && Array.isArray(apis_id) && apis_id.length > 0 && apis_id.filter((e) => { return mongoose.isValidObjectId(e) }).length == apis_id.length) {
        apis_id = apis_id.map((e) => { return new ObjectId(e) })
        Api.find({ _id: apis_id }, null, opts).then((value) => {
            try {
                if (value && Array.isArray(value) && value.length != 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun api trouvé.", type_error: "no-found" });
                }
            }
            catch (e) {

            }
        }).catch((err) => {
            callback({ msg: "Impossible de chercher l'élément.", type_error: "error-mongo" });
        });
    }
    else if (apis_id && Array.isArray(apis_id) && apis_id.length > 0 && apis_id.filter((e) => { return mongoose.isValidObjectId(e) }).length != apis_id.length) {
        callback({ msg: "Tableau non conforme plusieurs éléments ne sont pas des ObjectId.", type_error: 'no-valid', fields: apis_id.filter((e) => { return !mongoose.isValidObjectId(e) }) });
    }
    else if (apis_id && !Array.isArray(apis_id)) {
        callback({ msg: "L'argement n'est pas un tableau.", type_error: 'no-valid' });

    }
    else {
        callback({ msg: "Tableau non conforme.", type_error: 'no-valid' });
    }
}


module.exports.findManyApis = function (search, page, limit, options, callback) {
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
        Api.countDocuments(query_mongo).then((value) => {
            if (value > 0) {
                const skip = ((page - 1) * limit)
                Api.find(query_mongo, null, { skip: skip, limit: limit, populate: populate, lean: true }).then((results) => {
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

module.exports.updateOneApi = function (api_id, update, callback) {
    if (api_id && mongoose.isValidObjectId(api_id)) {
        Api.findByIdAndUpdate(api_id, update, { new: true, runValidators: true })
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Api non trouvé.", type_error: "no-found" });
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

module.exports.updateManyApis = function (apis_id, update, callback) {
    if (Array.isArray(apis_id) && apis_id.length > 0 && apis_id.every(mongoose.isValidObjectId)) {
        const ids = apis_id.map(id => new ObjectId(id));
        Api.updateMany({ _id: { $in: ids } }, update, { runValidators: true })
            .then((value) => {
                if (value.modifiedCount > 0) {
                    callback(null, value);
                } else {
                    callback({ msg: "Aucun api trouvé.", type_error: "no-found" });
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

module.exports.deleteOneApi = function (api_id, callback) {
    if (api_id && mongoose.isValidObjectId(api_id)) {
        Api.findByIdAndDelete(api_id)
            .then((value) => {
                if (value) {
                    callback(null, value.toObject());
                } else {
                    callback({ msg: "Api non trouvé.", type_error: "no-found" });
                }
            })
            .catch((err) => {
                callback({ msg: "Impossible de supprimer l'élément.", type_error: "error-mongo" });
            });
    } else {
        callback({ msg: "ObjectId non conforme.", type_error: 'no-valid' });
    }
};

module.exports.deleteManyApis = function (apis_id, callback) {
    if (Array.isArray(apis_id) && apis_id.length > 0 && apis_id.every(mongoose.isValidObjectId)) {
        const ids = apis_id.map(id => new ObjectId(id));
        Api.deleteMany({ _id: { $in: ids } })
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
