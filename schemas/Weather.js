const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weatherSchema = new Schema({
    data_id: {
        type: Number,
        required: false
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: false,
    },
    city: {
        type: String,
        required: true,
        unique: true
    },
    temp: {
        type: Number,
        required: true
    },
    humidity: {
        type: Number,
        required: true
    },
    wind: {
        type: String,
        required: true
    },
    sunrise: {
        type: Number,
        required: true
    },
    sunset: {
        type: Number,
        required: true
    },
    lon: {
        type: Number,
        required: true
    },
    lat: {
        type: Number,
        required: true
    },
    pressure: {
        type: Number,
        required: true
    },
    visibility: {
        type: Number,
        required: true
    }
})


module.exports = weatherSchema;