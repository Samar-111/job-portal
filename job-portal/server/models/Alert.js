const mongoose = require('mongoose');

const AlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    keyword: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: ""
    },
    jobType: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Alert', AlertSchema);
