const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma de l'utilisateur
const userSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, // Assure que chaque email est unique dans la base de données
        index: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    location: {
        type: String
    },
    unit: {
        type: String,
        required: true
    },
    wind_speed: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    }
});

// Création du modèle User à partir du schéma
const User = mongoose.model('User', userSchema);

module.exports = User;