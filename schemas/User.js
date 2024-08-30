const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma de l'utilisateur
const userSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    email: {
        type: String,
        required: true,
        unique: true, // Assure que chaque email est unique dans la base de données
        index: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String
    },
    location: {
        type: String
    },
    unit: {
        type: String,
        required: false
    },
    wind_speed: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    }
});

// Création du modèle User à partir du schéma
// const User = mongoose('User', userSchema);

module.exports = userSchema;