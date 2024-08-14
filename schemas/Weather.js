const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const weatherSchema = new Schema({
    data_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    user_id: {
        type: Schema.Types.ObjectId,
        required: true
    },
    city: {
        type: String,
        required: true
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
    }
})


module.exports = weatherSchema;