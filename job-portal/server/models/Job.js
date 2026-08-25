const mongoose = require('mongoose');

// This defines what a "Job" looks like in the database
const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
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
    description: {
        type: String,
        default: ""
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
        default: 'Full-time'
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    applications: [{
        candidate: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        resumeUrl: {
            type: String
        },
        resumeName: {
            type: String
        },
        status: {
            type: String,
            enum: ['Applied', 'Shortlisted', 'Rejected'],
            default: 'Applied'
        },
        appliedAt: {
            type: Date,
            default: Date.now
        }
    }],
    postedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', JobSchema);