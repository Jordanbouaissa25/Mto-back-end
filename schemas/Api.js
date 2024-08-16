const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const apiSchema = new Schema({
    user_id: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    api_id: {
        type: Schema.Types.ObjectId,
        required: false
    },
    api_name: {
        type: String,
        required: true
    },
    endpoint_url: {
        type: String,
        required: true

    },
    api_key: {
        type: String,
        required: true
    },
    rate_limit: {
        type: Number,
        required: true
    },
    last_fetched: {
        type: Date,
        default: Date.now
    }
})

apiSchema.pre('save', function (next) {
    this.last_feteched = Date.now();
    next();
});

module.exports = apiSchema