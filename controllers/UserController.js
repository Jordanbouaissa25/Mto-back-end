const UserService = require('../services/UserService')
const LoggerHttp = require('../utils/logger').http
const passport = require('passport')

// La fonction pour gerer l'authentification depuis passport
module.exports.loginUser = function (req, res, next) {
    passport.authenticate('login', { badRequestMessage: "Les champs sont manquants." }, async function (err, user) {
        if (err) {
            res.statusCode = 405
            return res.send({ msg: "Le nom d'utilisateur ou mot de passe n'est pas correct.", type_error: "no-valid-login" })
        }
        else {
            req.logIn(user, async function (err) {
                if (err) {
                    console.log(err)
                    res.statusCode = 500
                    return res.send({ msg: "Problème d'authentification sur le serveur.", type_error: "internal" })
                }
                else {
                    return res.send(user)
                }
            })
        }
    })(req, res, next)
}

module.exports.logoutUser = function (req, res) {
    req.log.info("Déconnexion d'un utilisateur")
    UserService.updateOneUser(req.user._id, { token: "" }, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)
        }
        else {
            res.statusCode = 201
            res.send({ message: "L'utilisateur est déconnecté." })
        }
    })
}

// La fonction permet d'ajouter un utilisateur.
module.exports.addOneUser = function (req, res) {
    req.log.info("Création d'un utilisateur")
    UserService.addOneUser(req.body, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "validator") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "duplicate") {
            res.statusCode = 405
            res.send(err)
        }
        else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet d'ajouter plusieurs utilisateurs.
module.exports.addManyUsers = function (req, res) {
    req.log.info("Création de plusieurs utilisateurs")
    UserService.addManyUsers(req.body, null, function (err, value) {
        if (err) {
            res.statusCode = 405
            res.send(err)
        }
        else {
            res.statusCode = 201
            res.send(value)
        }
    })
}

// La fonction permet de chercher un utilisateur.
module.exports.findOneUserById = function (req, res) {
    req.log.info("Chercher un utilisateur")
    UserService.findOneUserById(req.params.id, null, function (err, value) {
        // 
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

module.exports.findOneUser = function (req, res) {
    var fields = req.query.fields
    if (fields && !Array.isArray(fields))
        fields = [fields]
    req.log.info("Chercher un utilisateur")
    UserService.findOneUser(fields, req.query.value, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

module.exports.findManyUsers = function (req, res) {
    let page = req.query.page;
    let limit = req.query.limit;
    let search = req.query.q
    req.log.info("Chercher des utilisateurs")
    UserService.findManyUsers(search, page, limit, null, (err, value) => {
        if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de chercher plusieurs utilisateurs.
module.exports.findManyUsersById = function (req, res) {
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    req.log.info("Chercher plusieurs utilisateurs")
    UserService.findManyUsersById(arg, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}
module.exports.updateOneUser = function (req, res) {
    const userId = req.params.id;
    const userData = req.body;
    req.log.info("Modifier un utilisateur")
    UserService.updateOneUser(userId, userData, null, (err, value) => {
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
    })
};

module.exports.updatePassword = function (req, res) {
    const email = req.body.email
    const newPassword = req.body.newPassword;
    req.log.info("Modifier un mot de passe")
    UserService.findOneAndUpdate({ email: email }, { password: newPassword }, null, (err, value) => {
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
    })
}

module.exports.findOneAndUpdate = function (req, res) {
    const updateData = req.body; // Par exemple { password: "NewPass123" }

    req.log.info("Mise à jour des informations d'un utilisateur");

    UserService.findOneAndUpdate({ _id: req.user._id }, updateData, null, (err, value) => {
        if (err && err.type_error === "no-found") {
            res.statusCode = 404;
            res.send(err);
        } else if (err && (err.type_error === "no-valid" || err.type_error === "validator" || err.type_error === "duplicate")) {
            res.statusCode = 405;
            res.send(err);
        } else {
            res.statusCode = 200;
            res.send(value);
        }
    });
};

module.exports.updateManyUsers = function (req, res) {
    let usersId = req.query.id; // Récupère les IDs des utilisateurs à mettre à jour depuis le corps de la requête
    const updateData = req.body; // Récupère les données mises à jour depuis le corps de la requête
    if (usersId && !Array.isArray(usersId)) {
        usersId = [usersId]
    }
    req.log.info("Modifier plusieurs utilisateurs")
    UserService.updateManyUsers(usersId, updateData, null, (err, value) => {
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

// La fonction permet de supprimer un utilisateur.
module.exports.deleteOneUser = function (req, res) {
    req.log.info("Supprimer un utilisateur")
    UserService.deleteOneUser(req.params.id, null, function (err, value) {
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

// La fonction permet de supprimer plusieurs utilisateurs.
module.exports.deleteManyUsers = function (req, res) {
    //  console.log(arg)
    var arg = req.query.id
    if (arg && !Array.isArray(arg))
        arg = [arg]
    req.log.info("Supprimer plusieurs utilisateurs")
    //  console.log(arg)
    UserService.deleteManyUsers(arg, null, function (err, value) {
        //    console.log(err)
        if (err && err.type_error == "no-found") {
            res.statusCode = 404
            res.send(err)
        }
        else if (err && err.type_error == "no-valid") {
            res.statusCode = 405
            res.send(err)
        }
        else if (err && err.type_error == "error-mongo") {
            res.statusCode = 500
            res.send(err)
        }
        else {
            res.statusCode = 200
            res.send(value)
        }
    })
}

