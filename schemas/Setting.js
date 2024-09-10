const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Définition du schéma des paramètres
const settingSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'User' // Référence au modèle User
    },
    setting_temperature: {
        type: String,
        enum: ["°C", "°F"],
        required: true
    },
    setting_wind: {
        type: String,
        enum: ["km/h", "mi/h"],
        required: true
    },
    city: {
        type: String,
        required: false
    },
});

// Création du modèle Settings à partir du schéma
// const Settings = mongoose.model('Settings', settingSchema);

module.exports = settingSchema;
