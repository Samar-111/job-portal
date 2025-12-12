const mongoose = require('mongoose');

// This defines what a "Job" looks like in the database
const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // This field must exist
    },
    company: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        default: "Not disclosed"
    },
    postedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);