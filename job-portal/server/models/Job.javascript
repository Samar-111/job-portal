const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  description: { type: String, required: true },
  salary: { type: Number, required: true },
  type: { type: String, default: 'Full-time' }, // e.g., Full-time, Remote
  postedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Job', JobSchema);