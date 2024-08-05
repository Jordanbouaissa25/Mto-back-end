const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma des paramètres
const settingsSchema = new Schema({
    setting_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Référence au modèle User
    },
    setting_temperature: {
        type: String,
        enum: ["°C, F"],
        required: true
    },
    setting_wind: {
        type: String,
        enum: ["Km/h, mi/h"],
        required: true
    },
    City: {
        type: String,
        required: true
    },
    Dark_mode: {
        type: String,
        required: true
    },
    White_mode: {
        type: String,
        required: true
    },
});

// Création du modèle Settings à partir du schéma
const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
