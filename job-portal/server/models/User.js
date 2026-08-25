const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['candidate', 'recruiter'], default: 'candidate' },
    profile: {
        fullName: { type: String, default: "" },
        bio: { type: String, default: "" },
        skills: { type: [String], default: [] },
        resumeUrl: { type: String, default: "" },
        resumeName: { type: String, default: "" }
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
});

module.exports = mongoose.model('User', UserSchema);