const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma des paramètres
const settingSchema = new Schema({
    setting_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User' // Référence au modèle User
    },
    setting_temperature: {
        type: String,
        enum: ["°C", "°F"],
        required: false
    },
    setting_wind: {
        type: String,
        enum: ["km/h", "mi/h"],
        required: false
    },
    city: {
        type: String,
        required: false
    },
    update_email: {
        type: String,
        required: true,
        unique: true, // Assure que chaque email est unique dans la base de données
        index: true
    },
    update_password: {
        type: String,
        required: true
    },
    Dark_mode: {
        type: String,
        required: false
    },
    White_mode: {
        type: String,
        required: false
    },
});

// Création du modèle Settings à partir du schéma
// const Settings = mongoose.model('Settings', settingSchema);

module.exports = settingSchema;
